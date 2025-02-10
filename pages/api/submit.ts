
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { google } from "googleapis";

type SheetForm = {
  Name: string;
  PhoneNumber: string;
  Product: string;
  Description: string;
};
function generateCode() {
  // Generate 3 random digits
  const code = Math.floor(100 + Math.random() * 900);

  // Get today's date
  const today = new Date();
  const date = today.getDate();
  const month = today.getMonth() + 1; // Months are zero-indexed
  const year = today.getFullYear();

  // Format the date as DD/MM/YYYY
  const formattedDate = `${date}/${month}/${year}`;

  return `${code} - ${formattedDate}`;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) 
{
  if (req.method === "POST") {
    // Handle POST request
    const body = req.body as SheetForm;

    try {
      // Append data to Google Sheets
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: [
          "https://www.googleapis.com/auth/drive",
          "https://www.googleapis.com/auth/drive.file",
          "https://www.googleapis.com/auth/spreadsheets",
        ],
      });

      const sheets = google.sheets({
        auth,
        version: "v4",
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "A1:D1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [body.Name, body.PhoneNumber,  body.Product, body.Description]
          ],
        },
      });

      // Send SMS using Sparrow SMS API
      const sparrowsmsConfig = {
        headers: {
          Authorization: `Bearer ${process.env.SPARROW_SMS_TOKEN}`,
        },
      };

      const smsData = {
        token: process.env.SPARROW_SMS_TOKEN,
        from: "TheAlert",
        to: body.PhoneNumber, // Assuming PhoneNumber is a valid 10-digit number of Nepal
        text : `Hey ${body.Name}! \nThank you for reaching out to Samparka! We will respond promptly. Please feel free to contact us at +977 9843742684 if you need further assistance.\n- Samparka`
      };
      
      const smsResponse = await axios.post(
        "https://api.sparrowsms.com/v2/sms/",
        smsData,
        sparrowsmsConfig
      );

      return res.status(200).json({
        message: "Data appended to Google Sheets and SMS sent successfully",
        smsResponse: smsResponse.data,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Handle unsupported methods
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}


