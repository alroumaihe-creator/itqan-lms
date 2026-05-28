// تأكد أن هذا الجزء موجود ومحدث في ملف StudentsPage.tsx
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      try {
        const response = await fetch(`${apiUrl}/students`);
        if (!response.ok) throw new Error('فشل الاتصال');
        const data = await response.json();
        // هنا نجلب البيانات الحقيقية من قاعدة البيانات
        setStudents(data); 
      } catch (e) { 
        console.error("خطأ في جلب البيانات:", e); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchStudents();
  }, []); // [] تعني أن هذا الكود سيعمل بمجرد فتح الصفحة