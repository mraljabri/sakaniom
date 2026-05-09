import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function TermsPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const Section = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );

  if (isAr) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الشروط والأحكام</h1>
        <p className="text-gray-500 text-sm">آخر تحديث: مايو 2026</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
        <p className="text-amber-800 font-semibold text-base">⚠️ إخلاء المسؤولية</p>
        <p className="text-amber-700 mt-1 text-sm leading-relaxed">
          سكني عُمان منصة إعلانات فقط. لا نتحمل أي مسؤولية عن أي صفقات أو اتفاقيات أو نزاعات تنشأ بين المستخدمين خارج المنصة. جميع الاتفاقيات تتم بشكل مباشر بين المالك والمستأجر.
        </p>
      </div>

      <Section title="1. قبول الشروط">
        <p>باستخدامك لمنصة سكني عُمان، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.</p>
      </Section>

      <Section title="2. طبيعة المنصة">
        <p>سكني عُمان هي منصة إلكترونية تتيح للملاك نشر إعلانات العقارات وللمستأجرين الاطلاع عليها. المنصة وسيط إعلاني فقط ولا تكون طرفاً في أي اتفاقية إيجار.</p>
        <p>جميع المفاوضات والعقود وعمليات الدفع تتم مباشرة بين المالك والمستأجر خارج المنصة.</p>
      </Section>

      <Section title="3. إخلاء المسؤولية">
        <p>لا تتحمل سكني عُمان المسؤولية عن:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>أي احتيال أو نصب يقع بين المستخدمين</li>
          <li>صحة أو دقة المعلومات المقدمة في الإعلانات</li>
          <li>أي خسائر مالية أو أضرار ناجمة عن استخدام المنصة</li>
          <li>النزاعات التي تنشأ بين الملاك والمستأجرين</li>
          <li>جودة العقارات المُعلن عنها أو مطابقتها للوصف</li>
          <li>أي مدفوعات تتم خارج المنصة</li>
        </ul>
      </Section>

      <Section title="4. مسؤوليات المُعلن (المالك)">
        <ul className="list-disc list-inside space-y-1">
          <li>يجب أن تكون المعلومات المقدمة صحيحة ودقيقة</li>
          <li>يُحظر نشر إعلانات مزيفة أو مضللة</li>
          <li>يتحمل المُعلن المسؤولية الكاملة عن محتوى إعلانه</li>
          <li>يجب الالتزام بقوانين الإيجار المعمول بها في سلطنة عُمان</li>
        </ul>
      </Section>

      <Section title="5. مسؤوليات المستخدم (المستأجر)">
        <ul className="list-disc list-inside space-y-1">
          <li>التحقق من صحة العقار ومعلوماته قبل الدفع أو توقيع أي عقد</li>
          <li>عدم إرسال أي مدفوعات قبل التحقق الشخصي من العقار</li>
          <li>توخي الحذر عند التعامل مع الغرباء</li>
          <li>إبلاغ الجهات المختصة في حال الاشتباه بأي احتيال</li>
        </ul>
      </Section>

      <Section title="6. نصائح السلامة">
        <ul className="list-disc list-inside space-y-1">
          <li>زر العقار شخصياً قبل الدفع أو التوقيع</li>
          <li>لا تُرسل دفعات مسبقة عبر التحويل البنكي لأشخاص لا تعرفهم</li>
          <li>احتفظ بنسخة من جميع العقود والاتفاقيات</li>
          <li>تأكد من هوية المالك قبل إتمام أي صفقة</li>
        </ul>
      </Section>

      <Section title="7. الإبلاغ عن المخالفات">
        <p>إذا لاحظت أي إعلان مخالف أو مشبوه، يُرجى التواصل معنا عبر البريد الإلكتروني حتى نتمكن من مراجعته وإزالته.</p>
      </Section>

      <Section title="8. القانون المطبق">
        <p>تخضع هذه الشروط لقوانين سلطنة عُمان. أي نزاع يخضع للاختصاص القضائي للمحاكم العُمانية.</p>
      </Section>

      <Section title="9. التعديلات">
        <p>تحتفظ سكني عُمان بحق تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية.</p>
      </Section>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center">
        <p className="text-gray-500 text-sm">باستخدام المنصة فإنك توافق على هذه الشروط.</p>
        <Link to="/" className="text-primary-600 font-semibold text-sm hover:underline mt-2 inline-block">العودة للرئيسية</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-gray-500 text-sm">Last updated: May 2026</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
        <p className="text-amber-800 font-semibold text-base">⚠️ Important Disclaimer</p>
        <p className="text-amber-700 mt-1 text-sm leading-relaxed">
          SakaniOM is an advertising platform only. We are not responsible for any transactions, agreements, scams, or disputes that occur between users outside the platform. All rental agreements are made directly between the landlord and the tenant.
        </p>
      </div>

      <Section title="1. Acceptance of Terms">
        <p>By using SakaniOM, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the platform.</p>
      </Section>

      <Section title="2. Nature of the Platform">
        <p>SakaniOM is an online advertising platform that allows property owners to post listings and potential tenants to browse them. The platform acts solely as an advertising intermediary and is not a party to any rental agreement.</p>
        <p>All negotiations, contracts, and payments occur directly between the landlord and the tenant outside of this platform.</p>
      </Section>

      <Section title="3. Disclaimer of Liability">
        <p>SakaniOM is not responsible for:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Any fraud, scam, or deception that occurs between users</li>
          <li>The accuracy or truthfulness of any listing information</li>
          <li>Any financial losses or damages arising from use of the platform</li>
          <li>Disputes between landlords and tenants</li>
          <li>The quality of advertised properties or whether they match their description</li>
          <li>Any payments made outside the platform</li>
          <li>Actions taken by users based on information found on this platform</li>
        </ul>
      </Section>

      <Section title="4. Responsibilities of Landlords">
        <ul className="list-disc list-inside space-y-1">
          <li>All information provided in listings must be accurate and truthful</li>
          <li>Posting false or misleading listings is strictly prohibited</li>
          <li>The landlord bears full responsibility for the content of their listing</li>
          <li>Listings must comply with the rental laws of the Sultanate of Oman</li>
        </ul>
      </Section>

      <Section title="5. Responsibilities of Tenants">
        <ul className="list-disc list-inside space-y-1">
          <li>Verify the property and its details in person before making any payment or signing any contract</li>
          <li>Do not send any advance payments before personally inspecting the property</li>
          <li>Exercise caution when dealing with unknown individuals</li>
          <li>Report any suspected fraud to the relevant authorities in Oman</li>
        </ul>
      </Section>

      <Section title="6. Safety Tips">
        <ul className="list-disc list-inside space-y-1">
          <li>Always visit the property in person before paying or signing anything</li>
          <li>Do not send advance payments via bank transfer to unknown individuals</li>
          <li>Keep copies of all contracts and agreements</li>
          <li>Verify the landlord's identity before completing any transaction</li>
        </ul>
      </Section>

      <Section title="7. Reporting Violations">
        <p>If you notice any suspicious or fraudulent listing, please contact us so we can review and remove it promptly.</p>
      </Section>

      <Section title="8. Governing Law">
        <p>These Terms are governed by the laws of the Sultanate of Oman. Any disputes shall be subject to the jurisdiction of Omani courts.</p>
      </Section>

      <Section title="9. Modifications">
        <p>SakaniOM reserves the right to modify these Terms at any time. Users will be notified of any significant changes.</p>
      </Section>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center">
        <p className="text-gray-500 text-sm">By using this platform you agree to these terms.</p>
        <Link to="/" className="text-primary-600 font-semibold text-sm hover:underline mt-2 inline-block">Back to Home</Link>
      </div>
    </div>
  );
}
