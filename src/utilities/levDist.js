function levDist(s,t){//https://stackoverflow.com/a/11958496/5697837
	// Step 1
	let n = s.length;
	let m = t.length;
	if(!n){
		return m
	}
	if(!m){
		return n
	}
	let d = []; //2d matrix
	for(var i = n; i >= 0; i--) d[i] = [];
	// Step 2
	for(var i = n; i >= 0; i--) d[i][0] = i;
	for(var j = m; j >= 0; j--) d[0][j] = j;
	// Step 3
	for(var i = 1; i <= n; i++){
		let s_i = s.charAt(i - 1);
		// Step 4
		for(var j = 1; j <= m; j++){
			//Check the jagged ld total so far
			if(i === j && d[i][j] > 4){
				return n
			}
			let t_j = t.charAt(j - 1);
			let cost = (s_i === t_j) ? 0 : 1; // Step 5
			//Calculate the minimum
			let mi = d[i - 1][j] + 1;
			let b = d[i][j - 1] + 1;
			let c = d[i - 1][j - 1] + cost;
			if(b < mi){
				mi = b
			}
			if(c < mi){
				mi = c;
			}
			d[i][j] = mi; // Step 6
			//Damerau transposition
			/*if (i > 1 && j > 1 && s_i === t.charAt(j - 2) && s.charAt(i - 2) === t_j) {
				d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
			}*/
		}
	}
	return d[n][m]
}
