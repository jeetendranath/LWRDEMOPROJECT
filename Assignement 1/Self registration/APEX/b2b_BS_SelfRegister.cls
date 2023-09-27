public without sharing class b2b_BS_SelfRegister {
    /**
    * create's the Account record and also create's the Buyer Account Record 
      and assign user to the buyer group member and returns the Account ID,Account Name in Map.
    * @param #1 firstName: Pass the firstname of the account.
    * @param #2 lastName: Pass the lastname of the account.
    * @param #3 phone: Pass the phone number of the account.
    */

    @AuraEnabled
    public static Map<String,String> createAccount(String firstName, String lastName, String phone)
    {
       
       List<BuyerGroup>  BuyerGroupMemberId = [SELECT Id FROM BuyerGroup WHERE Name =:b2b_BS_Constants.RegisteredBuyerGroupName];
       
        Map<String,String> createAccMap = new Map<String,String>();
        try 
        {
                Account userAccount = new Account();
                userAccount.Name = firstName +' '+ lastName;
                userAccount.Phone = phone;
                insert userAccount;
                userAccount.IsPartner = true;
                update userAccount;

                BuyerAccount buyerAcc = new BuyerAccount();
                buyerAcc.BuyerId = userAccount.Id;
                buyerAcc.Name = userAccount.Name;
                buyerAcc.IsActive = true;
                insert buyerAcc;

                BuyerGroupMember buyergroupmem = new BuyerGroupMember();
                buyergroupmem.buyerId = userAccount.Id;
                buyergroupmem.BuyerGroupId = BuyerGroupMemberId[0].Id;
                insert buyergroupmem;

                createAccMap.put('Id', userAccount.Id);
                createAccMap.put('Name', userAccount.Name);
                return createAccMap;
        } 
        catch (Exception e) 
        {
                System.debug('Account Error'  + e.getMessage());
                throw new AuraHandledException('User Account or company Account Already exist: '  + e.getMessage());
                
        }
    }

    /**
    * create's the Contact record and returns the contact Id in Map.
    * @param #1 firstName: Pass the firstname of the contact.
    * @param #2 lastName: Pass the lastname of the contact.
    * @param #3 email: Pass the email number of the contact.
    * @param #4 phone: Pass the phone number of the contact.
    * @param #5 accountId: Pass the accountId to which the contact was related.
    */

    @AuraEnabled
    public static Map<String,String> createContact(String firstName, String lastName, String email, String phone, Id accountId){
        
        Map<String,String> contactMap1= new Map<String,String>(); 
        try {
            Contact contact1 = new Contact();
            contact1.Lastname = firstName +' '+ lastName;
            contact1.Email = email;
            contact1.Phone = phone;
            contact1.AccountId = accountId;
            insert contact1;
            contactMap1.put('Id', contact1.Id);
            return contactMap1;
  
        } catch (Exception e) {
            System.debug('Contact Error' + e.getMessage());
            throw new AuraHandledException('Contact Error :'+e.getMessage());
        }
    }

    /**
    * create's the User reference and returns the User object.
    * @param #1 firstName: Pass the firstname of the User.
    * @param #2 lastName: Pass the lastname of the User.
    * @param #3 email: Pass the email number of the User.
    * @param #4 contactID: Pass the contactId for which contact user is created.
    */

    @AuraEnabled
    public static User createUser(String firstName, String lastName, String email, Id contactID){

        List<Profile> profileId = [SELECT ID FROM Profile WHERE Name =:b2b_BS_Constants.PROFILE]; 
        
        try {
            String currentDateTime = String.valueOf(DateTime.now().getTime());
            String userAlias = firstName.SubString(0,1) + lastName.SubString(0,2)+currentDateTime.SubString(0,4);

            User user1 = new User(TimeZoneSidKey='America/Los_Angeles',
            LocaleSidKey='en_US',LanguageLocaleKey='en_US',
            ProfileId=profileId[0].Id,
            EmailEncodingKey='ISO-8859-1',
            Alias =userAlias,
            Username = email,
            Email = email,
            FirstName = firstName,
            LastName=lastName,
            ContactId = contactID ,
            CommunityNickName = firstName +' '+ lastName + currentDateTime.SubString(0,3) );
            return user1;
   
        } catch (Exception e) {
            System.debug('User Error: '+ e.getMessage());
            throw new AuraHandledException('User Error: '+ e.getMessage());
        }
    }

    /**
    *  create's register's the user i.e it calls the method  createAccount , createContact, createUser and create's the
        records in account , contact , user and returns there Id's and name . It also creates the external site user and
        gives the page reference to login.
        it returns the userId,pagereference in Map.
    * @param #1 userData: Pass the all the data of the user.
    */


    @AuraEnabled
    public static Map<String,Object> registerUser(Map<String, Object> userData)
    {
        
        Map<String,Object> registerUserMap= new Map<String,Object>();
        Map<String,String> accountMap= new Map<String,String>();
        Map<String,String> contactMap= new Map<String,String>(); 
        String firstName = (String)userData.get('FirstName');
        String lastName = (String)userData.get('LastName');
        String phone = (String)userData.get('Phone');
        String email = (String)userData.get('Email');
        String password = (String)userData.get('Password');

        Boolean isEmailDuplicate = isEmailExist(email);
        Boolean isPhoneDuplicate = isPhoneExist(phone);

        if(!isEmailDuplicate && !isPhoneDuplicate){
            registerUserMap.put('IsDuplicateFound', false);
            accountMap =  createAccount(firstName,lastName, phone);
            String acctID = accountMap.get('Id');
            String acctName = accountMap.get('Name');
            
            contactMap =  createContact(firstName, lastName, email, phone, acctID);
            String conID = contactMap.get('Id');
            user u = createUser(firstName, lastName, email, ConID);        
            try
            {
                String userId = Site.createExternalUser(u, acctId, password);
                if(userId != null)
                {
                    registerUserMap.put('UserId', userId);
                    ApexPages.PageReference pageRef = Site.login(u.Username,password,b2b_BS_Constants.BASEPATH);
                    registerUserMap.put('pageRef',pageRef.getURL()) ;
                    Boolean isPermissionSetGroupAssigned = setPermissionSetGroup(userId);
                }
            }
            catch(Site.ExternalUserCreateException e)
            {
                List <String> errors = e.getDisplayMessages();
                for(String error:errors)
                {
                    System.debug('error:' +error);
                }
                System.debug(e.getMessage());
                registerUserMap.put('error',e.getMessage());
            }

        }else{
            registerUserMap.put('IsDuplicateFound', true);

            if(isEmailDuplicate){
                registerUserMap.put('isEmailExist', true);
            }
            if(isPhoneDuplicate){
                registerUserMap.put('isPhoneExist', true);
            }
        }
    
        
        return registerUserMap;         
    }

    /**
    *  checks whether the new user email was unique or not and returns the Boolean value.
    * @param #1 Email: Pass the Email for which we need to check the duplicate in the contact object.
    */
    
    @AuraEnabled
    public static boolean isEmailExist(String Email){
        try 
        {
            List <Contact> emailDupList = [SELECT Id,Email FROM Contact WHERE Email =:Email];
            
            if(emailDupList.isEmpty())
            {
                return false;
            }
            else
            {
                return true;
            } 
        } 
        catch (Exception e) 
        {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
    *  checks whether the new user phone was unique or not and returns the Boolean value.
    * @param #1 Phone: Pass the phone for which we need to check the duplicate in the contact object.
    */

    @AuraEnabled
    public static boolean isPhoneExist(String Phone){
        try 
        {
            
            List <Contact> phoneDupList = [SELECT id,Phone FROM Contact WHERE Phone =:Phone];
            
            if(phoneDupList.isEmpty())
            {
                return false;
            }
            else
            {
                return true;
            } 
        } 
        catch (Exception e) 
        {
            throw new AuraHandledException(e.getMessage());
        }
    }

     /**
    * assigns the permission set group to the newly created user.
    * @param #1 userId: Pass the userId to which we need to assign the permissionsetgroup.
    */

    @AuraEnabled
    public static Boolean setPermissionSetGroup(Id userId)
    {
        try{
            if (userId==Null) {

                return false;
            }
            else{

                List<PermissionSetGroup> PermissionSetGroupId = [SELECT Id FROM PermissionSetGroup  WHERE DeveloperName =:b2b_BS_Constants.PERMISSIONSETNAME];
                Id PermissionSetGroupId1= PermissionSetGroupId[0].Id;
    
                List<PermissionSetAssignment> psAssignments= new List<PermissionSetAssignment>();
                PermissionSetAssignment assignment = new PermissionSetAssignment(
                    PermissionSetGroupId = PermissionSetGroupId1, AssigneeId = userId);
                psAssignments.add(assignment);
                upsert psAssignments;
                return true ;
            }

        }
        catch (Exception e)
        {
            throw new AuraHandledException(e.getMessage());
        }
    }
}