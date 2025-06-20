export const Spinner = () => {
	return (
		<div>
			<span
				className="fa fa-circle-o-notch fa-spin"
				style={{
					marginLeft: 4,
					fontSize: "small",
				}}
			/>
			Loading...
		</div>
	);
};
