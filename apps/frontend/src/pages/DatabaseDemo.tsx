import { UserList } from "../components/UserList";
import { PostList } from "../components/PostList";
import { CreateUserForm } from "../components/CreateUserForm";
import { CreatePostForm } from "../components/CreatePostForm";
import { trpc } from "../App";

export function DatabaseDemo() {
	const { data: hello } = trpc.hello.useQuery();

	return (
		<div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
			<h1>tRPC + Orchid ORM Database Demo</h1>
			<div style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "5px", marginBottom: "20px" }}>
				<strong>Connection Status:</strong> {hello || "Loading..."}
			</div>
			
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
				<div>
					<CreateUserForm />
					<UserList />
				</div>
				<div>
					<CreatePostForm />
					<PostList />
				</div>
			</div>
			
			<div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#e7f3ff", borderRadius: "5px" }}>
				<h3>Features Demonstrated:</h3>
				<ul>
					<li>tRPC client-server communication with full TypeScript type safety</li>
					<li>Orchid ORM database queries with PostgreSQL</li>
					<li>Centralized error handling and formatting</li>
					<li>Real-time UI updates using React Query invalidation</li>
					<li>Form validation and error display</li>
					<li>Database relations (User ↔ Posts)</li>
				</ul>
			</div>
		</div>
	);
}