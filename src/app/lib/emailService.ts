import emailjs from '@emailjs/browser';
import { Order } from './types';

// EmailJS Credentials - Users should replace these with their own values from EmailJS dashboard
const SERVICE_ID = "YOUR_SERVICE_ID";
const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

export const emailService = {
  sendOrderConfirmation: async (order: Order) => {
    if (SERVICE_ID === "YOUR_SERVICE_ID") {
      console.warn("EmailJS credentials not set. Skipping email send.");
      return;
    }

    try {
      const templateParams = {
        to_name: order.customerName,
        to_email: order.customerEmail,
        order_id: order.id,
        order_date: order.date,
        total_amount: `RS. ${order.total.toLocaleString()}/-`,
        items_summary: order.items.map(item => `${item.name} x ${item.quantity}`).join(", "),
        address: order.customerAddress,
        phone: order.customerPhone,
        payment_method: order.paymentMethod,
        // For professional branding, usually passed as variables to the template
        store_name: "V-WOOD QUARTZ",
        logo_url: "https://img1.wsimg.com/isteam/ip/613470c5-0d44-4b59-8433-95c1c7696081/PicsArt_06-30-03.41.35.jpg"
      };

      const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log('Email sent successfully:', response.status, response.text);
      return response;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
};
