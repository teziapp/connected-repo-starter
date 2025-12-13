import { db } from "@backend/db/db";

export async function seedPrompts() {
	console.log("Seeding prompts...");

	// Clear existing prompts
	await db.prompts.where({}).delete();

	const prompts = [
		// Reflection & Gratitude
		{
			text: "What three things brought you joy today, no matter how small?",
			category: "gratitude",
			tags: ["reflection", "positivity", "daily"],
			isActive: true,
		},
		{
			text: "Who made a positive impact on your day, and how?",
			category: "gratitude",
			tags: ["relationships", "appreciation"],
		},
		{
			text: "What's one thing you're grateful for that you often take for granted?",
			category: "gratitude",
			tags: ["reflection", "mindfulness"],
		},

		// Personal Growth
		{
			text: "What challenge did you face today, and what did it teach you?",
			category: "growth",
			tags: ["learning", "challenges", "resilience"],
		},
		{
			text: "Describe a moment today when you stepped outside your comfort zone.",
			category: "growth",
			tags: ["courage", "development"],
		},
		{
			text: "What skill or habit are you working on, and what progress did you make today?",
			category: "growth",
			tags: ["goals", "progress", "self-improvement"],
		},

		// Self-Discovery
		{
			text: "What emotion did you feel most strongly today? What triggered it?",
			category: "self-awareness",
			tags: ["emotions", "mindfulness"],
		},
		{
			text: "If today was a chapter in your life story, what would you title it?",
			category: "self-awareness",
			tags: ["reflection", "creativity"],
		},
		{
			text: "What's one thing you learned about yourself this week?",
			category: "self-awareness",
			tags: ["learning", "identity"],
		},

		// Mindfulness & Present Moment
		{
			text: "Describe a moment today when you felt truly present. What were you doing?",
			category: "mindfulness",
			tags: ["presence", "awareness"],
		},
		{
			text: "What sounds, smells, or sensations did you notice today that you usually miss?",
			category: "mindfulness",
			tags: ["senses", "awareness"],
		},

		// Relationships
		{
			text: "What conversation stood out to you today, and why was it meaningful?",
			category: "relationships",
			tags: ["connection", "communication"],
		},
		{
			text: "How did you show kindness or support to someone today?",
			category: "relationships",
			tags: ["compassion", "giving"],
		},
		{
			text: "Who do you miss, and what would you tell them if they were here?",
			category: "relationships",
			tags: ["connection", "longing"],
		},

		// Goals & Aspirations
		{
			text: "What's one small action you took today toward a bigger goal?",
			category: "goals",
			tags: ["progress", "achievement"],
		},
		{
			text: "If you could change one thing about tomorrow, what would it be and why?",
			category: "goals",
			tags: ["planning", "intention"],
		},
		{
			text: "What does success look like for you this month?",
			category: "goals",
			tags: ["vision", "planning"],
		},

		// Creativity & Imagination
		{
			text: "If you could design your perfect day, what would it look like?",
			category: "creativity",
			tags: ["imagination", "dreams"],
		},
		{
			text: "What's a dream or idea that's been on your mind lately?",
			category: "creativity",
			tags: ["aspirations", "vision"],
		},

		// Challenges & Resilience
		{
			text: "What's weighing on your mind right now? How can you lighten that load?",
			category: "mental-health",
			tags: ["stress", "coping", "self-care"],
		},
		{
			text: "Describe a difficult situation you've overcome in the past. What strengths did you use?",
			category: "resilience",
			tags: ["strength", "overcoming"],
		},
		{
			text: "What's one thing you can let go of to feel lighter?",
			category: "mental-health",
			tags: ["release", "peace"],
		},

		// Evening Reflection
		{
			text: "What was the highlight of your day?",
			category: "daily-reflection",
			tags: ["evening", "recap"],
		},
		{
			text: "What would you do differently if you could replay today?",
			category: "daily-reflection",
			tags: ["learning", "improvement"],
		},
		{
			text: "What are you looking forward to tomorrow?",
			category: "daily-reflection",
			tags: ["anticipation", "planning"],
		},

		// Self-Care & Wellness
		{
			text: "How did you take care of your physical or mental health today?",
			category: "self-care",
			tags: ["wellness", "health"],
		},
		{
			text: "What does self-care look like for you right now?",
			category: "self-care",
			tags: ["wellness", "needs"],
		},

		// Wisdom & Learning
		{
			text: "What's the most interesting thing you learned or heard today?",
			category: "learning",
			tags: ["knowledge", "curiosity"],
		},
		{
			text: "If you could give your younger self one piece of advice, what would it be?",
			category: "wisdom",
			tags: ["reflection", "growth"],
		},

		// Purpose & Meaning
		{
			text: "What made you feel fulfilled or purposeful today?",
			category: "purpose",
			tags: ["meaning", "fulfillment"],
		},
		{
			text: "What values guided your decisions today?",
			category: "purpose",
			tags: ["values", "integrity"],
		},
		{
			text: "How did you make a difference today, big or small?",
			category: "purpose",
			tags: ["impact", "contribution"],
		},
	];

	// Insert prompts with isActive: true
	const promptsWithActive = prompts.map(prompt => ({ ...prompt, isActive: true }));
	await db.prompts.createMany(promptsWithActive);

	console.log(`✓ Seeded ${prompts.length} journal prompts`);
}