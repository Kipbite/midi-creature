interface Props {
	handleUpload: ( formData: FormData ) => void
};

export default function FileUpload( { handleUpload }: Props ) {
	return (
		<div>
			<form action={ handleUpload }>
				<input
					type="file"
					accept=".mid"
					name="midi-file"
				/>
				<button type="submit">Submit</button>
			</form>
		</div>
	);
}