export interface TransactionReceiptData {
  donorName: string;
  receiptNumber: string;
  amount: number;
  buildingName: string;
  roomNumber: string;
  paymentMode: string;
  date: string;
}

export function buildReceiptCaption(data: TransactionReceiptData, mandalName?: string): string {
  const title = mandalName ? `*${mandalName}*` : `*Shree Ganeshaya Namah*`;
  
  return `🙏 ${title} 🙏

Dear *${data.donorName}*,

Thank you for your generous contribution towards the Ganpati Festival.

Your donation has been successfully received.

📄 Receipt No : ${data.receiptNumber}
💰 Amount : ₹${data.amount}
🏢 Building : ${data.buildingName}
🏠 Flat : ${data.roomNumber}
💳 Payment Mode : ${data.paymentMode}
📅 Date : ${data.date}

Your receipt is attached with this message.

We sincerely appreciate your support and contribution.

May Lord Ganesha bless you and your family with happiness, prosperity, and success.

🙏 Ganpati Bappa Morya! 🙏`;
}
