import nodemailer from "nodemailer";

export const sendVerificationEmail = async (user) => {
  try {
    // Create a test account asynchronously
    //const account = await nodemailer.createTestAccount();
    //console.log("Credentials obtained: ", account);

    // Configure transporter with the dynamically created account
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // Use TLS for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password or regular password
      },
    });

    // Construct the verification URL
    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${user.verificationToken}`;
    console.log("Verification URL:", verificationUrl); // Log the URL being sent in the email

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Your App" <${account.user}>`,
      to: user.email,
      subject: "Please verify your email address",
      html: `<p>Hello ${user.username || "User"},</p>
             <p>Please click the link below to verify your email address:</p>
             <a href="${verificationUrl}">Verify Email</a>
             <p>This link will expire in 24 hours.</p>`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully! Message ID: %s", info.messageId); // Log the message ID
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); // Log the preview URL (useful for debugging)

    return info; // Return info object for further usage if needed
  } catch (error) {
    console.error("Error sending email:", error); // Log detailed error
    throw error; // Propagate the error for higher-level handling
  }
};
