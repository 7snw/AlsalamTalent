import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../Style/TermsPage.css";
import { NavConfig1, NavConfig2, NavConfig3, NavConfig4 } from "../Data/NavbarConfigs";

export default function TermsPage() {
  const [navbarConfig, setNavbarConfig] = useState(NavConfig1);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role;
    switch (role) {
      case "freelancer":
        setNavbarConfig(NavConfig2);
        break;
      case "client":
        setNavbarConfig(NavConfig3);
        break;
      case "admin":
        setNavbarConfig(NavConfig4);
        break;
      default:
        setNavbarConfig(NavConfig1);
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <Navbar links={navbarConfig} />

      <div className="terms-container">
        <div className="terms-inner">
          <h1 className="terms-heading">CTRLZ Terms of Service &amp; User Agreement</h1>
          <p className="terms-meta">Last updated: 4 November 2025</p>

          <div className="terms-content">
            <p>
              CTRLZ (the “Platform” or “CTRLZ”) is a digital freelancing platform established, owned, and operated by Al Salam Bank B.S.C. (the “Bank”) in collaboration with Bahrain Polytechnic (“Polytechnic”) pursuant to the Memorandum of Understanding entered into between the Bank and Polytechnic (the “MoU”). CTRLZ is designed to connect eligible Polytechnic students and graduates (“Users”) with freelance assignments, creative briefs, and related opportunities offered or facilitated by the Bank. For the avoidance of doubt, CTRLZ functions solely as an intermediary platform, and nothing herein shall create any employment, agency, or partnership relationship between Users and the Bank or Polytechnic.
            </p>
            <p>
              By registering for an account, accessing, or using the CTRLZ platform, the User hereby agrees to be bound by the terms and conditions set forth in this Agreement.
            </p>

            <h3>1. Eligibility</h3>
            <p>
              1.1&nbsp;Registration is strictly limited to Bahrain Polytechnic students or graduates.<br />
              1.2&nbsp;Users who are twenty-one (21) years of age or older may register and participate independently.<br />
              1.3&nbsp;Users who are under twenty-one (21) years of age may only register and participate if their parent or legal guardian has provided verifiable consent in the form and manner required by the platform (e.g. electronic acknowledgement, uploaded consent form, or other method accepted by Bahrain Polytechnic).<br />
              1.4&nbsp;The User warrants that all information provided during registration, including the Student ID number, is true, accurate, current, and complete.<br />
              1.5&nbsp;The use of another individual’s credentials, including student ID, or the creation of false, fraudulent, or misleading accounts constitutes a material breach of this Agreement and may result in immediate suspension or termination, without prejudice to any further legal action.
            </p>

            <h3>2. Relationship of the Parties</h3>
            <p>
              2.1&nbsp;CTRLZ functions solely as an intermediary platform connecting Users with assignments or creative briefs provided by CTRLZ (“Briefs”).<br />
              2.2&nbsp;Users are engaged as independent contractors. Nothing contained herein shall be construed to create any employment, agency, partnership, fiduciary, or joint venture relationship between the Freelancer and CTRLZ, the Bankor Bahrain Polytechnic.<br />
              2.3&nbsp;Freelancers shall not represent themselves as employees, agents, or representatives of CTRLZ, the Bank, or Bahrain Polytechnic.
            </p>

            <h3>3. User Conduct</h3>
            <p>
              3.1&nbsp;Users shall conduct themselves with professionalism, integrity, and respect.<br />
              3.2&nbsp;The following conduct is strictly prohibited:<br />
              a) Misrepresentation of identity, qualifications, or deliverables.<br />
              b) Use of the platform for illegal, offensive, discriminatory, or unethical purposes;<br />
              c) Circumventing the platform for direct payment or services.<br />
              d) Disclosure or misuse of Confidential Information.<br />
              e) Submission of work that contravenes the applicable laws or Shari’a principles.
            </p>

            <h3>4. Confidentiality</h3>
            <p>
              4.1&nbsp;Freelancers may be granted access to confidential and proprietary information, including but not limited to bank briefs, campaigns, data, and materials (“Confidential Information”).<br />
              4.2&nbsp;All Confidential Information remains the sole property of CTRLZ, the Bank, or its partners, as applicable.<br />
              4.3&nbsp;Freelancers are prohibited from disclosing, reproducing, storing, or using Confidential Information for any purpose other than the execution of the assigned Brief.<br />
              4.4&nbsp;Breach of this clause shall entitle CTRLZ to pursue immediate termination of the account, injunctive relief, damages, and any other remedies available under Bahraini law.<br />
              4.5&nbsp;The obligations under this Section shall survive the termination of this Agreement.
            </p>

            <h3>5. Intellectual Property</h3>
            <p>
              5.1&nbsp;All deliverables, materials, content, designs, works, inventions, developments, data, and other results created, prepared, or delivered by the User through or in connection with the Platform (collectively, the “Work Product”) shall be deemed to be “works made for hire” for the benefit of the Bank.<br />
              5.2&nbsp;To the extent that any Work Product or any part thereof does not qualify as a “work made for hire” under applicable law, the User hereby irrevocably assigns, transfers, and conveys to the Bank, with full title guarantee and free from all encumbrances, all rights, title, and interest (including all intellectual property rights) in and to the Work Product, worldwide and for the full duration of such rights.<br />
              5.3&nbsp;The User irrevocably waives, to the fullest extent permitted by law, any and all moral rights or equivalent rights (including rights of paternity, integrity, disclosure, and withdrawal) in relation to the Work Product.<br />
              5.4&nbsp;The User shall not use, reproduce, adapt, distribute, publish, resell, or exploit the Work Product for any purpose other than the performance of assignments under this Agreement, unless expressly authorised in writing by the Bank.<br />
              5.5&nbsp;The User shall promptly execute all documents and perform all further acts reasonably necessary to give full effect to this clause, including assisting the Bank in securing, maintaining, defending, and enforcing any intellectual property rights in the Work Product.
            </p>

            <h3>6. Payments</h3>
            <p>
              6.1&nbsp;Users must have an active Al Salam Bank account to receive payments. Transfers to other banks are not supported.<br />
              6.2&nbsp;Payments to Users shall be processed exclusively through CTRLZ’s internal payroll system.<br />
              6.3&nbsp;The Freelancer is required to provide their accurate International Bank Account Number (IBAN) and identification details.<br />
              6.4&nbsp;CTRLZ reserves the right to withhold or delay payment in the event of breach of this Agreement, suspected fraud, or failure to deliver work in accordance with agreed specifications.<br />
              6.5&nbsp;All payments are subject to applicable taxation laws and regulations in the Kingdom of Bahrain.
            </p>

            <h3>7. Privacy and Data Protection</h3>
            <p>
              7.1&nbsp;CTRLZ collects and processes limited personal data, including but not limited to name, email address, student ID, contact information, portfolio details, and payment credentials, strictly for the purpose of platform operation.<br />
              7.2&nbsp;Data shall be processed in accordance with the Bahrain Personal Data Protection Law (Law No. 30 of 2018).<br />
              7.3&nbsp;CTRLZ shall not sell or disclose personal data to third parties, save as required by law or necessary for the operation of the platform.<br />
              7.4&nbsp;By using the platform, Users consent to the use of cookies and similar technologies for technical and performance purposes.
            </p>

            <h3>8. Membership and Account Use</h3>
            <p>
              8.1&nbsp;Each User may create one account only.<br />
              8.2&nbsp;Sharing of accounts, login credentials, or access rights with third parties is strictly prohibited.<br />
              8.3&nbsp;CTRLZ reserves the right to suspend or terminate accounts at its sole discretion in the event of breach or misuse.
            </p>

            <h3>9. Dispute Resolution</h3>
            <p>
              9.1&nbsp;The parties shall initially attempt to resolve any dispute amicably through good-faith negotiations.<br />
              9.2&nbsp;If unresolved, the dispute shall be dealt with in accordance with clause 21 of this Agreement.
            </p>

            <h3>10. Assignment and Subcontracting</h3>
            <p>
              10.1&nbsp;The User shall not assign, transfer, subcontract, or otherwise dispose of any of their rights or obligations under this Agreement without the prior written consent of the Bank.<br />
              10.2&nbsp;CTRLZ, the Bank, and Bahrain Polytechnic may assign or transfer their rights and obligations under this Agreement to affiliates or successors without the User’s consent.
            </p>

            <h3>11. Limitation of Liability</h3>
            <p>
              11.1&nbsp;CTRLZ is provided on an “as is” and “as available” basis. CTRLZ, Al Salam Bank B.S.C., and Bahrain Polytechnic make no representations, warranties, or undertakings of any kind, whether express, implied, statutory, or otherwise, including without limitation any warranties of merchantability, satisfactory quality, fitness for a particular purpose, accuracy, completeness, availability, uninterrupted access, or non-infringement.<br />
              11.2&nbsp;To the maximum extent permitted by applicable law, in no event shall CTRLZ, the Bank, or Bahrain Polytechnic (or their respective affiliates, officers, directors, employees, or agents) be liable to any User or third party for:<br />
              a) loss of profits, revenue, business, contracts, or goodwill;<br />
              b) loss of data or corruption of data;<br />
              c) any indirect, incidental, special, punitive, exemplary, or consequential damages; or<br />
              d) any claims, damages, or liabilities arising out of or related to the use of, or inability to use, the Platform or participation in assignments,<br />
              whether in contract, tort (including negligence), breach of statutory duty, or otherwise, even if foreseeable or advised of the possibility of such damages.<br />
              11.3&nbsp;Without prejudice to clause 10.2, the aggregate liability of CTRLZ, the Bank, and Bahrain Polytechnic (and their respective affiliates, officers, directors, employees, and agents), whether in contract, tort, or otherwise, arising out of or in connection with this Agreement shall in no circumstances exceed the total amount of fees actually paid by the Bank to the User for the assignment giving rise to the claim.<br />
              11.4&nbsp;Nothing in this Agreement shall exclude or limit liability for death or personal injury caused by negligence, fraud, fraudulent misrepresentation, or any other liability which cannot be excluded or limited under applicable law.
            </p>

            <h3>12. Indemnity</h3>
            <p>
              12.1&nbsp;The User shall indemnify, defend, and hold harmless the Bank, Bahrain Polytechnic, and their respective affiliates, officers, directors, employees, agents, and representatives (together, the “Indemnified Parties”) from and against any and all claims, demands, actions, proceedings, damages, losses, liabilities, costs, charges, and expenses (including reasonable legal and professional fees) which may be incurred or suffered by, or made or brought against, any of the Indemnified Parties, arising out of or in connection with:<br />
              a) any breach by the User of this Agreement (including any warranties, obligations, or representations hereunder);<br />
              b) any negligent, fraudulent, unlawful, or wilful act or omission of the User;<br />
              c) any infringement or alleged infringement of intellectual property rights, moral rights, or confidentiality obligations by the User in connection with any deliverables or participation on the Platform; and<br />
              d) any violation by the User of applicable laws, regulations, or Bahrain Polytechnic’s Code of Conduct.<br />
              12.2&nbsp;The indemnities given in this clause shall apply whether or not the Indemnified Parties were aware of or could have foreseen such claims, losses, or liabilities, and shall survive the suspension, termination, or expiry of this Agreement.
            </p>

            <h3>13. Termination</h3>
            <p>
              13.1&nbsp;CTRLZ may suspend or terminate User accounts at any time, with or without notice, in the event of breach or suspected misconduct.<br />
              13.2&nbsp;Users may request account closure at any time.<br />
              13.3&nbsp;Confidentiality and payment obligations shall survive termination.
            </p>

            <h3>14. Amendments</h3>
            <p>
              14.1&nbsp;CTRLZ reserves the right to amend or update this Agreement at any time.<br />
              14.2&nbsp;Amendments shall be effective upon publication on the platform. Continued use of the platform shall be deemed as acceptance of the amended terms.
            </p>

            <h3>15. Waiver</h3>
            <p>
              15.1&nbsp;No failure, delay, or omission by CTRLZ, the Bank, or Bahrain Polytechnic in exercising any right, power, or remedy provided by this Agreement or by law shall operate as a waiver of that right, power, or remedy, nor shall any single or partial exercise preclude any other or further exercise of that or any other right, power, or remedy.<br />
              15.2&nbsp;A waiver shall be valid only if given expressly in writing and signed by an authorized representative of the waiving party.
            </p>

            <h3>16. Severability</h3>
            <p>
              16.1&nbsp;If any provision of this Agreement is held to be invalid, illegal, or unenforceable by a court or tribunal of competent jurisdiction, such provision shall be severed to the extent necessary for the remainder of the Agreement to continue in full force and effect.<br />
              16.2&nbsp;The Parties shall negotiate in good faith to replace any invalid, illegal, or unenforceable provision with a valid and enforceable substitute provision that most closely reflects the original intent of the Parties.
            </p>

            <h3>17. Further Assurance</h3>
            <p>
              17.1&nbsp;The User shall, at the Bank’s request and expense, promptly execute and deliver such documents and perform such acts as may be reasonably required to give full effect to this Agreement, including the assignment of rights and enforcement of confidentiality and intellectual property provisions.
            </p>

            <h3>18. Survival</h3>
            <p>
              18.1&nbsp;Any provision of this Agreement which expressly or by implication is intended to survive termination or expiry (including confidentiality, intellectual property, indemnity, limitation of liability, waiver, severability, and governing law) shall continue in full force and effect.
            </p>

            <h3>19. Entire Agreement</h3>
            <p>
              19.1&nbsp;This Agreement constitutes the entire agreement between CTRLZ and the User in relation to the use of the Platform and supersedes and extinguishes all prior agreements, understandings, arrangements, promises, or representations, whether oral or written, relating to its subject matter.
            </p>

            <h3>20. Notices</h3>
            <p>
              20.1&nbsp;Any notice or communication required to be given under this Agreement shall be in writing and delivered via the Platform, by email to the registered email address of the User, or to such other contact details as may be notified from time to time.<br />
              20.2&nbsp;Notices shall be deemed received upon successful transmission.
            </p>

            <h3>21. Governing Law</h3>
            <p>
              21.1&nbsp;This Agreement and any matter, claim or dispute arising out of or in connection with this Agreement, whether contractual or non-contractual, is to be governed by and determined in accordance with the laws of the Kingdom of Bahrain to the extent that such laws are not repugnant to the principles of Shariah in which case the principles of Shariah shall prevail. The Parties recognize and agree that the concept of the payment of interest is repugnant to the principles of Shariah and accordingly, to the extent that any legal system would impose (whether by contract or statute) any obligation to pay interest, each Party hereby irrevocably and unconditionally expressly waives and rejects any entitlement to recover interest from the other.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
