import { trpc } from "../App";

export const HelloWorld = () => {
	const hello = trpc.hello.useQuery(undefined, {
		suspense: true,
	});

	if (hello.isError) return <div>Error: {hello.error.message}</div>;

	return <div>{hello.data}</div>;
};
