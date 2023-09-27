import { LightningElement, track } from 'lwc';
import registerUser from '@salesforce/apex/b2b_BS_SelfRegister.registerUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ToastContainer from 'lightning/toastContainer';
import basePath from '@salesforce/community/basePath';
import { NavigationMixin } from 'lightning/navigation';
import userRegistration from '@salesforce/label/c.B2B_BS_User_Register';
import contactEmail from '@salesforce/label/c.B2B_BS_Contact_Email';
import contactFirstName from '@salesforce/label/c.B2B_BS_Contact_Firstname';
import contactLastname from '@salesforce/label/c.B2B_BS_Contact_Lastname';
import contactPhone from '@salesforce/label/c.B2B_BS_Contact_Phone';
import password from '@salesforce/label/c.B2B_BS_Password';
import confirmPassword from '@salesforce/label/c.B2B_BS_Confirm_Password';
import emailExist from '@salesforce/label/c.B2B_BS_Email_Exist';
import phoneExist from '@salesforce/label/c.B2B_BS_Phone_Exist';
import succefullRegister from '@salesforce/label/c.B2B_BS_Successfull_Register';
import passwordStrength from '@salesforce/label/c.B2B_BS_Password_Strength';
import passwordError from '@salesforce/label/c.B2B_BS_Password_Error';
import registerError from '@salesforce/label/c.B2B_BS_Error';
import register from '@salesforce/label/c.B2B_BS_Register';
import alreadyAMember from '@salesforce/label/c.B2B_BS_Registered_User';
import loginURL from '@salesforce/label/c.B2B_BS_Login_URL';


export default class UserRegistration extends NavigationMixin(LightningElement) {
    labels={
        userRegistration,
        contactFirstName,
        contactLastname,
        contactPhone,
        contactEmail,
        password,
        confirmPassword,
        emailExist,
        phoneExist,
        succefullRegister,
        passwordStrength,
        passwordError,
        registerError,
        register,
        alreadyAMember,
        loginURL
    }
    firstName = '';
    lastName = '';
    phone = '';
    email = '';
    password = '';
    confirmPassword = '';
    error = '';
    showError = false;
    newUID;
    loginUrl;
    passwordStrengthValue;
    passwordStrengthColor;
    isLoading = false;
    passwordNotEqual = false;
    strengthText='';
    textStyle;
    connectedCallback(){
        const toastContainer = ToastContainer.instance();
        toastContainer.maxShown = 5;
        toastContainer.toastPosition = 'top-center';
    }



    handleRegistration() {
        if(this.isInputValid() && !this.passwordNotEqual && this.passwordStrengthValue >= 66 && this.password === this.confirmPassword){
            const data ={
                FirstName:this.firstName,
                LastName:this.lastName,
                Email:this.email,
                Phone:this.phone,
                Password:this.password
            }
            console.log('Registering Data>>>',data);
            this.isLoading= true;
            registerUser({userData : data})
            .then((result) => 
            {
                this.isLoading = false;
                console.log('result>>>',result);
                if (result.hasOwnProperty('IsDuplicateFound')) {
                    if (result.IsDuplicateFound) {
                        // Handle duplicate user found scenario
                        if (result.isEmailExist) {
                            // Email is duplicate
                            this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.labels.emailExist, variant: 'error' }));
                        }
                        if (result.isPhoneExist) {
                            // Phone is duplicate
                            this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.labels.phoneExist, variant: 'error' }));
                        }
                    } else {
                        // User registration success
                        this.newUID = result.UserId;
                        // Handle success scenario as needed
                        this.dispatchEvent(new ShowToastEvent({ title: 'Success', message:this.labels.register, variant: 'success' }));
                        // Redirect to the URL in 'pageRef' if needed
                        window.location.href = result.pageRef;
                    }
                }      
            })
            .catch((error) => {
                this.isLoading = false;
                console.log(error);
                if(error && error.body && error.body.message){
                    this.errorCheck = true;
                    this.errorMessage = error.body.message;
                    this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.errorMessage , variant: 'error' }));

                }           
                
            });
        }else{
            if(!this.isInputValid() || this.passwordNotEqual){
                this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.labels.registerError, variant: 'error' }));

            }
            if(this.isInputValid() && !this.passwordNotEqual && this.passwordStrengthValue < 66){
                this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.labels.passwordStrength, variant: 'error' }));

            }
            if(this.password !== this.confirmPassword){
                this.showError = true;
                this.error = this.labels.passwordError;
                this.passwordNotEqual = true;
            }

    }
    }

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }

    handleRegisterChange(event){
        if(event.target.dataset.id === 'firstName'){
            this.firstName = event.target.value;
        }else if(event.target.dataset.id === 'lastName'){
            this.lastName = event.target.value;
        }else if(event.target.dataset.id === 'email'){
            this.email = event.target.value;
        }else if(event.target.dataset.id === 'phone'){
            this.phone = event.target.value;
        }else if(event.target.dataset.id === 'password'){
            this.password = event.target.value;
            this.checkPasswordStrength();
        }else if(event.target.dataset.id === 'confirmpassword'){
            this.confirmPassword = event.target.value;
            if (this.password !== this.confirmPassword) {
                this.showError = true;
                this.error = this.labels.passwordError;
                this.passwordNotEqual = true;
            }else{
                this.showError = false;
                this.error = '';
                this.passwordNotEqual = false;
            }

        }
    }

    checkPasswordStrength() {
        const password = this.password;
        
        // Define regular expressions for different strength levels
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const moderateRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        
        if (strongRegex.test(password)) {
            this.passwordStrengthValue = 100; // Strong password
            this.passwordStrengthColor = 'green-color';
            this.strengthText = 'Strong' ; 
            this.textStyle='text-green';
        } else if (moderateRegex.test(password)) {
            this.passwordStrengthValue = 66; // Moderate password
            this.passwordStrengthColor = 'yellow-color';
            this.strengthText = 'Medium' ; 
            this.textStyle='text-yellow';


        } else {
            this.passwordStrengthValue = 33; // Weak password
            this.passwordStrengthColor = 'red-color';
            this.strengthText = 'Week' ; 
            this.textStyle='text-red';


        }
    }

    handleLoginIn(){
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: basePath +this.labels.loginURL
            }
        });
    }
}
