public with sharing class b2b_BS_contactUsController {

     /**
    * create's the case for the registered user.
    * @param #1 userId: Pass the Id of the user to whom the case need to be create.
    * @param #2 comment: Pass the comment entered by the user.
    */

    @AuraEnabled
    public static String createCase(String userId,String comment){
        try {
            list<user> userlist = [SELECT Id, ContactId FROM user WHERE Id =:userId ];
            case case1 = new Case();
            case1.Comments = comment;
            case1.Origin = 'web';
            case1.ContactId = userlist[0].ContactId;
            insert case1;
            return 'case created successfully';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
    * create's the lead for the unregistered user.
    * @param #1 data: Pass the all the required data to create the lead.
    */
    @AuraEnabled
    public static String createLead(Map<String, Object> data){
        try {
            lead lead1 = new Lead();
            lead1.Firstname =  (String)data.get('firstName');
            lead1.Lastname = (String)data.get('lastName');
            lead1.Email = (String)data.get('email');
            lead1.Company = (String)data.get('companyName');
            lead1.Comment__c = (String)data.get('comment');
            lead1.Lead_Type__c = 'B2B store';
            insert lead1;
            return 'lead created successfully';
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}