import { LightningElement,api } from 'lwc';
import logos from "@salesforce/resourceUrl/logos";   
import createCase from '@salesforce/apex/b2b_BS_contactUsController.createCase';
import createLead from '@salesforce/apex/b2b_BS_contactUsController.createLead'; 
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ToastContainer from 'lightning/toastContainer';
import LightningModal from 'lightning/modal';
import USER_ID from "@salesforce/user/Id";
import isGuest from '@salesforce/user/isGuest';
import basePath from '@salesforce/community/basePath';
import { NavigationMixin } from 'lightning/navigation';

import aboutUs from '@salesforce/label/c.B2B_BS_About_us';
import bicycleStopName from '@salesforce/label/c.B2B_BS_Bicyclestop';
import close from '@salesforce/label/c.B2B_BS_Close';
import comments from '@salesforce/label/c.B2B_BS_Comments';
import commentsPlaceholder from '@salesforce/label/c.B2B_BS_Comments_Placeholder';
import companyInfo from '@salesforce/label/c.B2B_BS_Company_Info';
import companyName from '@salesforce/label/c.B2B_BS_Company_name';
import contactEmail from '@salesforce/label/c.B2B_BS_Contact_Email';
import contactFirstName from '@salesforce/label/c.B2B_BS_Contact_Firstname';
import contactLastname from '@salesforce/label/c.B2B_BS_Contact_Lastname';
import contactUs from '@salesforce/label/c.B2B_BS_Contact_us';
import copyRight from '@salesforce/label/c.B2B_BS_Copyright';
import email from '@salesforce/label/c.B2B_BS_Email';
import facebook from '@salesforce/label/c.B2B_BS_Facebook';
import instagram from '@salesforce/label/c.B2B_BS_Instagram';
import phone from '@salesforce/label/c.B2B_BS_Phone';
import privacyPolicy from '@salesforce/label/c.B2B_BS_Privacy_Policy';
import social from '@salesforce/label/c.B2B_BS_Social';
import submit from '@salesforce/label/c.B2B_BS_Submit';
import tnc from '@salesforce/label/c.B2B_BS_Terms_and_Conditions';
import youtube from '@salesforce/label/c.B2B_BS_Youtube';
export default class B2B_BS_Footer extends NavigationMixin(LightningModal) {

   bicyclestoplogo = logos + "/white logo.png";
   instagram = logos + "/instagram.png";
   youtube = logos + "/youtube.png";
   facebook = logos + "/facebook.png";
   isRegisterModelOpen = false;
   isGuestModelOpen = false;
   isLoading = false;
   comment='';
   firstName = '';
   lastName = '';
   email = '';
   companyName='';
   @api privacypolicylink;
   @api aboutuslink;
   @api termsandconditionslink;
   labels={
    aboutUs,
    bicycleStopName,
    close,
    comments,
    commentsPlaceholder,
    companyInfo,
    companyName,
    contactEmail,
    contactFirstName,
    contactLastname,
    contactUs,
    copyRight,
    email,
    facebook,
    instagram,
    phone,
    privacyPolicy,
    social,
    submit,
    tnc,
    youtube
   }


   connectedCallback(){
      const toastContainer = ToastContainer.instance();
      toastContainer.maxShown = 5;
      toastContainer.toastPosition = 'top-center';
  }

   handleComment(event)
  {
    this.comment = event.target.value;
  }
   handleClick(){

   }

   handlePrivacyPolicy(){
      this[NavigationMixin.Navigate]({
         type: 'standard__webPage',
         attributes: {
             url: basePath + this.privacypolicylink
         }
     });
   }

   handleAboutUs(){
      this[NavigationMixin.Navigate]({
         type: 'standard__webPage',
         attributes: {
             url: basePath + this.aboutuslink
         }
     });
   }

   handletnc(){
      this[NavigationMixin.Navigate]({
         type: 'standard__webPage',
         attributes: {
             url: basePath + this.termsandconditionslink
         }
     });
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

   registerModelOpen(event){
      if(isGuest){
         this.isGuestModelOpen = true;
      }else{
         this.isRegisterModelOpen = true;
      }
   }
   handleClose(){
      this.isRegisterModelOpen = false;
      this.isGuestModelOpen = false;

   }

   handleCase(){
      if(this.isInputValid()){
         this.isLoading=true;
         this.handleClose();
         createCase({comment : this.comment, id : USER_ID})
         .then((result) =>
         {
            this.isLoading=false;
            this.dispatchEvent(new ShowToastEvent({ title: 'Succes', message: result, variant: 'success' }));
            console.log(result);
         })
         .catch((error) => {
            console.log(error);
            this.isLoading= false;
            if(error && error.body && error.body.message){
                this.errorMessage = error.body.message;
                this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.errorMessage , variant: 'error' }));
   
            }           
        });

      }
    
      
    }

    hadleLeadData(event){
      if(event.target.dataset.id === 'firstName'){
          this.firstName = event.target.value;
      }else if(event.target.dataset.id === 'lastName'){
          this.lastName = event.target.value;
      }else if(event.target.dataset.id === 'email'){
          this.email = event.target.value;
      }else if(event.target.dataset.id === 'companyName'){
          this.companyName = event.target.value;
      }else if(event.target.dataset.id === 'comment'){
          this.comment = event.target.value;
      }
      
   }

    handleLead(){
      if(this.isInputValid()){
         this.isLoading= true;
      this.handleClose();
      const data={
         firstName : this.firstName,
         lastName : this.lastName,
         email : this.email,
         companyName : this.companyName,
         comment : this.comment
      }
      createLead({data : data})
      .then((result) =>
      {
         this.isLoading = false;
         this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: result, variant: 'success' }));
         console.log(result);
      })
      .catch((error) => {
         this.isLoading = false;
         console.log(error);
         if(error && error.body && error.body.message){
             this.errorMessage = error.body.message;
             this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: this.errorMessage , variant: 'error' }));

         }           
      });

      }
      
    }
}