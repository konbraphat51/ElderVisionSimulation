var colorMatchingFunction, opticalDensity

//https://www.jstage.jst.go.jp/article/itej/62/7/62_7_1110/_pdf/-char/ja
function AgeColorSensitivity([r, g, b], age) {
	//>>integrate
	//compute all
	let values = []
	for (let wave = 380; wave <= 780; wave++) {
		values.push(_IntegratedFunction(wave, [r, g, b], age))
	}

	//add areas of trapezoid
	let area = 0
	for (let cnt = 0; cnt < values.length - 1; cnt++) {
		area += ((values[cnt] + values[cnt + 1]) * 1.0) / 2
	}
	//<<integrate

	return area
}

function _IntegratedFunction(wavelength, [r, g, b], age) {
	const [rl, gl, bl] = _ComputeSpectralSensitivity(wavelength)
	const s = _ComputeSpectralTransmittance(wavelength, age)
	const p = _ComputeSpectralCharacteristics([r, g, b], wavelength)

	return [s * p * rl, s * p * gl, s * p * rl]
}

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

function _ComputeSpectralTransmittance(wavelength, age) {
	return Math.pow(10, -_ComputeSpectralDensity(wavelength, age))
}

function _ComputeSpectralCharacteristics([r, g, b], wavelength) {
	const regularized = [r / 255, g / 255, b / 255]

	// based on liquid crystal display data from https://www.jstage.jst.go.jp/article/itej/62/7/62_7_1110/_pdf/-char/ja
	let _r = 0
	if (580 <= wavelength && wavelength <= 780) {
		_r = regularized[0] * 0.0383
	}
	let _g = 0
	if (480 <= wavelength && wavelength <= 585) {
		_g = regularized[1] * 0.0514
	}
	let _b = 0
	if (400 <= wavelength && wavelength <= 495) {
		_b = regularized[2] * 0.0876
	}

	return _r + _g + _b
}

function _ComputeSpectralDensity(wavelength, age) {
	if (age <= 60) {
		return (
			opticalDensity[wavelength][1] * (1 + 0.02 * (age - 32)) +
			opticalDensity[wavelength][2]
		)
	} else {
		return (
			opticalDensity[wavelength][1] * (1.56 + 0.0667 * (n - 60)) +
			opticalDensity[wavelength][2]
		)
	}
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

async function _FetchOpticalDensity() {
	// get OpticalDensity.csv
	const response = await fetch("OpticalDensity.csv")
	const raw = await response.text()

	//parse csv to dictionary
	const lines = raw.split("\n")
	let opticalDensity = {}
	let wavelengthes = []
	lines.forEach((line) => {
		const [wavelength, l, l1, l2] = line.split(",")
		opticalDensity[parseInt(wavelength)] = [l, l1, l2]
		wavelengthes.push(parseInt(wavelength))
	})

	//linear interpolation
	for (let cnt = 0; cnt < wavelengthes.length - 1; cnt++) {
		const front = wavelengthes[cnt]
		const back = wavelengthes[cnt + 1]

		for (let delta = 1; delta <= 9; delta++) {
			const wavelength = front + delta
			const ratio = delta / 10
			const l =
				opticalDensity[front][0] * (1 - ratio) + opticalDensity[back][0] * ratio
			const l1 =
				opticalDensity[front][1] * (1 - ratio) + opticalDensity[back][1] * ratio
			const l2 =
				opticalDensity[front][2] * (1 - ratio) + opticalDensity[back][2] * ratio
			opticalDensity[wavelength] = [l, l1, l2]
		}
	}

	return opticalDensity
}
opticalDensity = await _FetchOpticalDensity()

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
