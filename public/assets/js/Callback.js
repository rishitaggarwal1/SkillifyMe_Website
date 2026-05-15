const form = document.getElementById("callbackForm");

function isValidGmailAddress(email) {
  // Regular expression pattern for Gmail email addresses
  const gmailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/;

  // Check if the email matches the Gmail pattern
  return gmailPattern.test(email);
}

function isValidPhoneNumber(phoneNumber) {
  // Regular expression pattern for phone numbers
  const phonePattern = /^(\+\d{1,3}[- ]?)?\d{10}$/;

  // Remove any whitespace from the phone number
  const cleanedPhoneNumber = phoneNumber.replace(/\s/g, '');

  // Check if the cleaned phone number matches the pattern
  return phonePattern.test(cleanedPhoneNumber);
}


form.addEventListener("submit", async (event) => {
      console.log("S");
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const query = document.getElementById("query").value;

      if (!isValidGmailAddress(email)) {
        return;
      }

      if (!isValidPhoneNumber(phone)) {
        return;
      }

      const data = { name, email, phone, query };
      try {
        const response = await fetch("https://sheetdb.io/api/v1/ega5wjflhxheb", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert("Thankyou for submitting your response!")
          // window.location.href = "thankyou.html";
        } else {

          console.error("Error posting data to the API.");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
}); 



