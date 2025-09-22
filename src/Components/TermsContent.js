// src/Components/TermsContent.jsx
import React from "react";

export default function TermsContent({ hideTitle = false }) {
  return (
    <div className="terms-content">
      {!hideTitle && <h2>Terms & Conditions</h2>}

      {/* === Put your real T&C content below === */}
      <h3>1. Eligibility</h3>
      <p>
       •	Only Bahrain Polytechnic students or graduates aged 18 years and above are eligible to register.<br></br>
•	You confirm that all information provided in registration is accurate and truthful such as the ID number you have provided. <br></br>
•	The use of another Bahrain Polytechnic student’s ID number, or the creation of an account using false or borrowed credentials, is strictly prohibited and will be considered a serious violation of this Agreement, subject to disciplinary action including account suspension or termination
      </p>

      <h3>2. Relationship of Parties</h3>
      <p>
       •	ctrlZ operates as a freelancing platform connecting Freelancers with creative briefs provided by ctrlZ (the “Agency”).<br></br>
•	Freelancers are independent contractors, not employees or representatives of ctrlZ.<br></br>
•	Nothing in this Agreement creates an employment, joint venture, or partnership relationship.

      </p>

      <h3>3. User Conduct</h3>
      <p>
      •	Users must act with professionalism, integrity, and respect.<br></br>
•	Prohibited conduct includes (but is not limited to):<br></br>
o	Misrepresentation of identity, qualifications, or work.<br></br>
o	Use of ctrlZ to engage in illegal, offensive, or discriminatory activities.
o	Attempts to bypass the platform for payment or services.<br></br>
o	Sharing or using confidential information for personal or external gain.<br></br>
•	All work delivered must comply with Shari’a principles.

      </p>

      <h3>4. Confidentiality</h3>
      <p>
       •	Freelancers will receive access to confidential bank briefs, campaigns, and materials.<br></br>
•	All such materials remain the exclusive property of ctrlZ and its partners.<br></br>
•	Freelancers must not disclose, share, copy, or use confidential information for any purpose outside the assigned project.<br></br>
•	Breach of confidentiality may result in immediate account termination, legal action, and claims for damages.<br></br>
•	Confidentiality obligations survive account termination.

      </p>

      <h3>5. Intellectual Property</h3>
      <p>
        •	Unless otherwise agreed in writing, all deliverables created through ctrlZ are considered “work-for-hire” and ownership transfers to ctrlZ (or its client) upon full payment. <br></br>
•	Freelancers retain no rights to reuse, resell, or distribute project materials.

      </p>

      <h3>6. Payments & Payroll</h3>
      <p>
       •	Payments are processed through ctrlZ’s internal payroll system.<br></br>
•	Freelancers must provide accurate IBAN and identification details.<br></br>
•	ctrlZ reserves the right to withhold payment in cases of breach, fraud, or incomplete work.

      </p>
      <h3>7. Privacy & Data Protection</h3>
      <p>
       •	ctrlZ collects and processes limited user data (e.g., name, email, student ID, contact info, portfolio, payment details) to operate the platform.<br></br>
•	Data will not be sold or shared with third parties except as required by law or for platform operation.<br></br>
•	By using the platform, you consent to the use of cookies for technical and performance purposes.

      </p>

      <h3>8. Membership & Account Use</h3>
      <p>
      •	Users may only create one account.<br></br>
•	ctrlZ reserves the right to suspend or terminate accounts for violation of this Agreement.<br></br>
•	Freelancers must not share accounts with others.

      </p>
      <h3>9. Dispute Resolution</h3>
      <p>
       In the event of any dispute between ctrlZ and a Freelancer:<br></br>
1.	The parties shall first seek amicable resolution through mediation.<br></br>
2.	If unresolved, the matter shall proceed to binding arbitration under Bahraini law.<br></br>
3.	Litigation may only be pursued if arbitration fails, and jurisdiction shall be the Kingdom of Bahrain.

      </p>

      <h3>10. Limitation of Liability</h3>
      <p>
        •	ctrlZ provides the platform “as is” and does not guarantee availability, uninterrupted service, or specific project opportunities.<br></br>
•	ctrlZ is not liable for indirect, incidental, or consequential damages arising from platform use.

      </p>
      <h3>11. Termination</h3>
      <p>
      •	ctrlZ may terminate or suspend access at any time for violations of this Agreement.<br></br>
•	Freelancers may close their account at any time, but confidentiality, and payment obligations remain enforceable.

      </p>

      <h3>12. Amendments</h3>
      <p>
       •	ctrlZ may update these Terms periodically. Changes will be communicated through the platform. Continued use of the platform after updates constitutes acceptance.
      </p>

    
    </div>
  );
}
