var colorMatchingFunction

//https://www.jstage.jst.go.jp/article/itej/62/7/62_7_1110/_pdf/-char/ja
function AgeColor([r, g, b], age) {}

function _ComputeSpectralSensitivity(wavelength) {
	return _Multiply3x3Matrix(
		[
			[3.2405, -1.5372, -0.4985],
			[-0.9693, 1.876, 0.0416],
			[0.0556, -0.204, 1.0573],
		],
		colorMatchingFunction[wavelength],
	)
}

async function _FetchColorMatchingFunction() {
	//get colormatching.csv
	const response = await fetch("colormatching.csv")
	const raw = await response.text()

	//parse csv to dictionary
	const lines = raw.split("\n")
	let colormatching = {}
	lines.forEach((line) => {
		const [wavelength, x, y, z] = line.split(",")
		colormatching[parseInt(wavelength)] = [x, y, z]
	})

	return colormatching
}
colorMatchingFunction = await _FetchColorMatchingFunction()

function _Multiply3x3Matrix(matrix, vector) {
	return [
		matrix[0][0] * vector[0] +
			matrix[0][1] * vector[1] +
			matrix[0][2] * vector[2],
		matrix[1][0] * vector[0] +
			matrix[1][1] * vector[1] +
			matrix[1][2] * vector[2],
		matrix[2][0] * vector[0] +
			matrix[2][1] * vector[1] +
			matrix[2][2] * vector[2],
	]
}
