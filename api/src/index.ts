import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

// تهيئة الاتصال بقاعدة البيانات
const prisma = new PrismaClient();

// تهيئة تطبيق Express
const app = express();

// السماح بالاتصال من الواجهة الأمامية
app.use(cors({ origin: true }));
app.use(express.json());

// 1. مسار اختباري للتأكد من عمل الخادم
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "success", 
    message: "Itqan Academy API is running perfectly on Vercel!" 
  });
});

// 2. مسار لجلب قائمة الطلاب
app.get("/students", async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { user: true }
    });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// تحديد المنفذ للعمل محلياً على جهازك
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// تصدير التطبيق ليعمل سحابياً على Vercel
export default app;