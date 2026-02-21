const fs = require('fs');

function findSecretC(points, k) {
    let resultNumerator = 0n;
    let resultDenominator = 1n;

    for (let i = 0; i < k; i++) {
        let xi = points[i].x;
        let yi = points[i].y;

        let num = 1n;
        let den = 1n;

        for (let j = 0; j < k; j++) {
            if (i !== j) {
                let xj = points[j].x;
                num *= (0n - xj);
                den *= (xi - xj);
            }
        }

        let termNumerator = yi * num;
        let termDenominator = den;

        resultNumerator = (resultNumerator * termDenominator) + (termNumerator * resultDenominator);
        resultDenominator = resultDenominator * termDenominator;
    }

    if (resultNumerator % resultDenominator !== 0n) {
        return null; 
    }
    
    return resultNumerator / resultDenominator;
}

function getCombinations(arr, k) {
    let results = [];
    function helper(start, combo) {
        if (combo.length === k) {
            results.push([...combo]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            combo.push(arr[i]);
            helper(i + 1, combo);
            combo.pop();
        }
    }
    helper(0, []);
    return results;
}

function solve(filename) {
    try {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        const k = data.keys.k;
        let points = [];

        for (let key in data) {
            if (key === 'keys') continue;

            let x = BigInt(key);
            let base = parseInt(data[key].base);
            let value = data[key].value;
            
            let y = 0n;
            let bigBase = BigInt(base);
            for(let char of value) {
                 let digit = parseInt(char, base);
                 y = y * bigBase + BigInt(digit);
            }

            points.push({ x, y });
        }

        let combinations = getCombinations(points, k);
        let secretCounts = {};

        for (let combo of combinations) {
            let secret = findSecretC(combo, k);
            if (secret !== null) {
                let secStr = secret.toString();
                secretCounts[secStr] = (secretCounts[secStr] || 0) + 1;
            }
        }

        let bestSecret = null;
        let maxCount = 0;
        for (let sec in secretCounts) {
            if (secretCounts[sec] > maxCount) {
                maxCount = secretCounts[sec];
                bestSecret = sec;
            }
        }

        if (bestSecret) {
            console.log(`Secret for ${filename}: ${bestSecret}`);
        } else {
            console.log(`Failed to find a valid secret for ${filename}.`);
        }

    } catch (err) {
        console.error(`Error processing ${filename}:`, err.message);
    }
}

solve('testcase1.json');
solve('testcase2.json');