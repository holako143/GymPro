import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">تطبيق الجوال</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4 text-center">أهلاً بك في تطبيقنا!</h2>
        <p className="text-center mb-8">
          هذا مثال لصفحة ويب متجاوبة تم إنشاؤها باستخدام Next.js و Tailwind CSS.
        </p>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2">ميزة 1</h3>
            <p>وصف مختصر للميزة الأولى. هذه البطاقة ستظهر بشكل جيد على جميع الأجهزة.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2">ميزة 2</h3>
            <p>وصف مختصر للميزة الثانية. يتكيف التنسيق تلقائيًا مع حجم الشاشة.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2">ميزة 3</h3>
            <p>وصف مختصر للميزة الثالثة. جرب تغيير حجم نافذة المتصفح لترى التأثير.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 dark:bg-gray-800 text-center p-4 mt-8">
        <p>&copy; 2024. كل الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}