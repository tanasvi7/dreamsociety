const otpStore = {};

exports.sendOtpMock = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;
  // In production, send via Twilio
  console.log(`[MOCK] OTP for ${phone}: ${otp}`);
  return otp;
};

exports.verifyOtpMock = async (phone, otp) => {
  if (otpStore[phone] && otpStore[phone] === otp) {
    delete otpStore[phone];
    return true;
  }
  return false;
}; 