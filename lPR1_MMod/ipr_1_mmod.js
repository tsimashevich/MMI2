let probabilities = [];
let xVal = [];
let yVal = [];
let N = 0;
const X_START = 0;
const Y_START = 0;

const HAS_CONDITION_HISTORGRAM = false;
const HAS_INDEXES = false;
const HISTOGRAM_TO_FIXED_VALUES = 3;

if(HAS_CONDITION_HISTORGRAM) {
    document.getElementById(`histogram-cond`).style.display = `block`;
}

const printIndex = (variable, text) => HAS_INDEXES ? variable : text;

const fillTable = (table, xVal, yVal) => {
    table.innerHTML = '';

    table.innerHTML += `
       <tr>
           <th>X\\Y</th>
           ${yVal.map((num, i) => `<th>y<sub>${printIndex(i, `j`)}</sub> = ${num}</th>`).join('')}
       </tr>
       `;

    for (let i = 0; i < xVal.length; i++) {
        let tr = `<tr><th>x<sub>${printIndex(i, `i`)}</sub> = ${xVal[i]}</th>`;

        for (let j = 0; j < yVal.length; j++) {
            tr += `
               <td>
                   <input class="form-control form-control-sm" type="number" value="0.0" step="0.01"/>
               </td>
           `;
        }
        tr += '</tr>';
        table.innerHTML += tr;
    }
};

const fillTableProbability = (table, letter, subLetter, values, probabilities) => {
    table.innerHTML = '';

    table.innerHTML += `
       <tr>
           <th>${letter}<sub>${subLetter}</sub></th>
           ${values.map((num) => `<th>${num}</th>`).join('')}
       </tr>
       <tr>
           <th>p*<sub>${subLetter}</sub></th>
           ${probabilities.map((num) => `<td>${num}</td>`).join('')}
       </tr>
       `;
}

const fillTableProbabilityConditional = (table, values, probabilityConditional) => {
    table.innerHTML = '';

    table.innerHTML += `
       <tr>
           <th>y<sub>j</sub></th>
           ${values.map((num, i) => `<th>${num}</th>`).join('')}
       </tr>
       `;

    probabilityConditional.forEach((row, i) => {
        table.innerHTML += `
       <tr>
           <th>p<sub>${printIndex(i, `j`)}</sub>/X=${i}</th>
           ${row.map((num, j) => `<td>${num}</td>`).join('')}
       </tr>
       `;
    });
};

const fillTableProbabilityConditionalX = (table, xVal, yVal, сonditionalProbabilities) => {
    table.innerHTML = '';

    table.innerHTML += `
       <tr>
           <th>X\\Y</th>
           ${yVal.map((y, j) => `<th>y<sub>${printIndex(j, `j`)}</sub> = ${y}</th>`).join('')}
       </tr>
   `;

    for (let i = 0; i < сonditionalProbabilities.length; i++) {
        let row = `<tr><td>x<sub>${printIndex(i, `i`)}</sub> = ${xVal[i]}</td>`;

        for (let j = 0; j < сonditionalProbabilities[i].length; j++) {
            row += `<td>${сonditionalProbabilities[i][j].toFixed(HISTOGRAM_TO_FIXED_VALUES)}</td>`;
        }

        row += '</tr>'
        table.innerHTML += row;
    }
}

const drawHistogram = (ctx) => {
    let chart = null;

    return (data, keys) => {
        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: keys,
                datasets: data,
            },
            options: {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                            },
                        },
                    ],
                },
            },
        });
    };
};

const getXProbability = (probabilities) => {
    let xProbability = [];

    for (let i = 0; i < xVal.length; i++) {
        xProbability[i] = +probabilities[i].reduce((sum, val) => sum + val).toFixed(2);
    }
    return xProbability;
}
const getYProbability = (probabilities) => {
    let yProbability = [];

    for (let i = 0; i < yVal.length; i++) {
        yProbability[i] = 0;

        for (let j = 0; j < probabilities.length; j++)
            yProbability[i] += probabilities[j][i];

        yProbability[i] = +yProbability[i].toFixed(2);
    }
    return yProbability;
}

const getYProbabilityConditional = (probabilities, xProbability) => {
    const yProbabilityConditional = xProbability.map((px, i) => {
        let yProbability = [];

        for (let j = 0; j < probabilities[0].length; j++)
            yProbability.push(+(probabilities[i][j] / px).toFixed(2));

        return yProbability;
    });
    return yProbabilityConditional;
}

const generate = (xProbability, yProbabilityConditional) => {
    let e = Math.random();

    let xIndex = 0;
    let sum = 0;
    for (let i = 0; i < xProbability.length; i++) {
        if (e > sum && e <= sum + xProbability[i]) {
            xIndex = i;
            break;
        }

        sum += xProbability[i];
    }

    e = Math.random();

    let yIndex = 0;

    sum = 0;
    for (let i = 0; i < yProbabilityConditional[xIndex].length; i++) {
        if (e > sum && e <= sum + yProbabilityConditional[xIndex][i]) {
            yIndex = i;
            break;
        }

        sum += yProbabilityConditional[xIndex][i];
    }
    return [xIndex, yIndex];
};

const startMoment = (k, s, x, y, probabilities) => {
    let sum = 0;
    for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < y.length; j++) {
            sum += Math.pow(x[i], k) * Math.pow(y[j], s) * probabilities[i][j];
        }
    }

    return sum;
}

const centerMoment = (k, s, x, y, probabilities) => {
    const mx = startMoment(1, 0, x, y, probabilities);
    const my = startMoment(0, 1, x, y, probabilities);
    let sum = 0;

    for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < y.length; j++) {
            sum += Math.pow(x[i] - mx, k) * Math.pow(y[j] - my, s) * probabilities[i][j];
        }
    }
    return sum;
}

const drawX = drawHistogram(document.getElementById('myChartX'));
const drawY = drawHistogram(document.getElementById('myChartY'));
const drawXY = drawHistogram(document.getElementById('myChartXY'));

document.getElementById('table-btn').addEventListener('click', () => {
    let xSize = +document.getElementById('X').value;
    let ySize = +document.getElementById('Y').value;

    if (xSize.length !== 0 && Number(xSize > 1) && ySize.length !== 0 &&  Number(ySize > 1) ) {
        let currEl = X_START;
        xVal = [];
        for (let i = 0; i < xSize; i++)
            xVal.push(currEl++);

        currEl = Y_START;
        yVal = [];
        for (let i = 0; i < ySize; i++)
            yVal.push(currEl++);

        fillTable(document.getElementById('table'), xVal, yVal);

        document.getElementById('input-btn').style.display = 'block';
        document.getElementById('input-btn-main').style.display = 'block';
    }
    else {
        alert("X или Y имеют недопустимые значения!");
        return;
    }
});

document.getElementById('input-btn').addEventListener('click', () => {
    N = +document.getElementById('N').value;

    let sum = 0;
    probabilities = [];
    for (let i = 0; i < xVal.length; i++) {
        probabilities[i] = [];
        for (let j = 0; j < yVal.length; j++) {
            probabilities[i][j] = +table.querySelector(`tr:nth-child(${i + 2}) td:nth-child(${j + 2}) input`).value;
            sum += probabilities[i][j]
        }
    }

    if (+sum.toFixed(2) != 1) {
        alert("Сумма всех вероятностей в таблице должна быть равна 1!");
        return;
    }

    let xProbability = getXProbability(probabilities);
    let yProbability = getYProbability(probabilities);

    fillTableProbability(document.getElementById('tableX'), 'x', 'i', xVal, xProbability);
    fillTableProbability(document.getElementById('tableY'), 'y', 'j', yVal, yProbability);

    let yProbabilityConditional = getYProbabilityConditional(probabilities, xProbability);

    fillTableProbabilityConditional(document.getElementById('tableY1'), yVal, yProbabilityConditional);

    let data = [];
    for (let i = 0; i < N; i++)
        data.push(generate(xProbability, yProbabilityConditional));

    let xCount = {};
    let yCount = {};
    let сonditionalProbabilities = [];
    let pairs = [];

    for (let i = 0; i < xVal.length; i++) {
        сonditionalProbabilities[i] = [];

        for (let j = 0; j < yVal.length; j++) {
            сonditionalProbabilities[i][j] = 0;
            pairs.push(`X${printIndex(i, `i`)} = ${xVal[i]}; Y${printIndex(j, `j`)} = ${yVal[j]}`)
        }
    }

    for (let i = 0; i < N; i++) {
        const [x, y] = data[i];
        if (xCount[xVal[x]])
            xCount[xVal[x]]++;
        else
            xCount[xVal[x]] = 1;

        if (yCount[yVal[y]])
            yCount[yVal[y]]++;
        else
            yCount[yVal[y]] = 1;

        сonditionalProbabilities[x][y]++;
    }

    for (let i = 0; i < xVal.length; i++) {
        for (let j = 0; j < yVal.length; j++)
            сonditionalProbabilities[i][j] /= xCount[i];
    }

    fillTableProbabilityConditionalX(document.getElementById('XYMatrix'), xVal, yVal, сonditionalProbabilities);

    drawX(
        [
            { label: `Эмпирические данные`, data: Object.values(xCount).map((num) => num / N), backgroundColor: '#0F5EE1', type: 'bar' },
            { label: `Теоретические данные`, data: xProbability, backgroundColor: '#F7F400', type: 'bar' }
        ],
        Object.keys(xCount).map((Xi) => `Xi = ${Xi}` )
    );

    drawY(
        [
            { label: `Эмпирические данные`, data: Object.values(yCount).map((num) => num / N), backgroundColor: '#F7F400', type: 'bar' },
            { label: `Теоретические данные`, data: yProbability, backgroundColor: '#0F5EE1', type: 'bar' }
        ],
        Object.keys(yCount).map((Yj) => `Yj = ${Yj}` )
    );

    drawXY(
        [
            { label: `Эмпирические данные`, data: [].concat(...сonditionalProbabilities), backgroundColor: '#0F5EE1', type: 'bar' },
            { label: `Теоретические данные`, data: [].concat(...yProbabilityConditional), backgroundColor: '#F7F400', type: 'bar' },
        ],
        pairs
    );


    const meanX = startMoment(1, 0, xVal, yVal, probabilities);
    const meanY = startMoment(0, 1, xVal, yVal, probabilities);

    const varianceX = centerMoment(2, 0, xVal, yVal, probabilities);
    const varianceY = centerMoment(0, 2, xVal, yVal, probabilities);

    const correlation = centerMoment(1, 1, xVal, yVal, probabilities);

    const correlationCoefficient = correlation / Math.sqrt(varianceX * varianceY);

    document.getElementById('mean-x').innerHTML = meanX.toFixed(2);
    document.getElementById('mean-y').innerHTML = meanY.toFixed(2);
    document.getElementById('variance-x').innerHTML = varianceX.toFixed(2);
    document.getElementById('variance-y').innerHTML = varianceY.toFixed(2);
    document.getElementById('correlation').innerHTML = correlation.toFixed(2);
    document.getElementById('correlation-coefficient').innerHTML = correlationCoefficient.toFixed(2);

    document.getElementById('info').style.visibility = 'visible';
});
