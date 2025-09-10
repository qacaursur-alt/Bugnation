import { db } from "./db-local";
import { courseCategories, courseSubcategories } from "@shared/schema";

async function seedCategories() {
  try {
    console.log("Seeding course categories...");

    // Create Self-Paced category
    const [selfPacedCategory] = await db.insert(courseCategories).values({
      name: "Self-Paced",
      description: "Learn at your own pace with pre-recorded content and materials",
      type: "self_paced",
      icon: "BookOpen",
      color: "#3b82f6",
      orderIndex: 1,
    }).returning();

    console.log("Created Self-Paced category:", selfPacedCategory.id);

    // Create Live Classes category
    const [liveCategory] = await db.insert(courseCategories).values({
      name: "Live Classes",
      description: "Interactive live sessions with instructors and peers",
      type: "live",
      icon: "Users",
      color: "#10b981",
      orderIndex: 2,
    }).returning();

    console.log("Created Live Classes category:", liveCategory.id);

    // Create subcategories for Self-Paced
    const selfPacedSubcategories = [
      {
        categoryId: selfPacedCategory.id,
        name: "Fundamentals",
        description: "Basic concepts and foundational knowledge",
        icon: "BookOpen",
        color: "#3b82f6",
        orderIndex: 1,
      },
      {
        categoryId: selfPacedCategory.id,
        name: "Advanced",
        description: "Advanced topics and specialized skills",
        icon: "Settings",
        color: "#8b5cf6",
        orderIndex: 2,
      },
      {
        categoryId: selfPacedCategory.id,
        name: "Automation",
        description: "Test automation tools and frameworks",
        icon: "Play",
        color: "#f59e0b",
        orderIndex: 3,
      },
      {
        categoryId: selfPacedCategory.id,
        name: "Manual Testing",
        description: "Manual testing techniques and methodologies",
        icon: "FileText",
        color: "#ef4444",
        orderIndex: 4,
      },
    ];

    for (const subcategory of selfPacedSubcategories) {
      const [created] = await db.insert(courseSubcategories).values(subcategory).returning();
      console.log("Created Self-Paced subcategory:", created.name);
    }

    // Create subcategories for Live Classes
    const liveSubcategories = [
      {
        categoryId: liveCategory.id,
        name: "Premium Live Classes",
        description: "Interactive live sessions with expert instructors",
        icon: "Users",
        color: "#10b981",
        orderIndex: 1,
      },
      {
        categoryId: liveCategory.id,
        name: "Workshops",
        description: "Hands-on workshops and practical sessions",
        icon: "Settings",
        color: "#06b6d4",
        orderIndex: 2,
      },
      {
        categoryId: liveCategory.id,
        name: "Mentorship",
        description: "One-on-one mentorship and guidance",
        icon: "BookOpen",
        color: "#8b5cf6",
        orderIndex: 3,
      },
    ];

    for (const subcategory of liveSubcategories) {
      const [created] = await db.insert(courseSubcategories).values(subcategory).returning();
      console.log("Created Live Classes subcategory:", created.name);
    }

    console.log("✅ Course categories and subcategories seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
  }
}

// Run the seed function
seedCategories().then(() => {
  console.log("Seed script completed");
  process.exit(0);
}).catch((error) => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
