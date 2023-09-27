import { LightningElement,api } from 'lwc';
import companyProducts from '@salesforce/resourceUrl/company_products';

export default class B2B_BS_Carousel extends LightningElement {
    @api carouseloneurl;
    @api carouseltwourl;
    @api carouselthreeurl;

    product1Url = companyProducts + '/product1.jpg';
    product2Url = companyProducts + '/product2.jpg';
    product3Url = companyProducts + '/product3.jpg';
}