
exports.doTrainingAndReview = async function (SC, account, iterationCount) {
    let clientCount = await SC.clientCount();
    clientCount = clientCount.toNumber();
    let clients = [];
    for (let i = 0; i < clientCount; i++) {

        let address = await SC.addresses(i);

        let client = await SC.clients(address);
        client.address = address;
        clients.push(client);
    }
    // console.log(clientCount);
    // console.log(clients);


    var startTime = Date.now()
    await run(SC, account, clientCount, clients); // run the script
    var endTime = Date.now()

    var perfTime = endTime - startTime;
    // console.log(`doTrainingAndReview takes ${perfTime} milliseconds`)
    return perfTime;
}

/**
 * Trainer and Reviewer Contribution Script
 * 
 * This script simulates the Federated Learning (FL) training evaluation submission and determine
 * if a trainer or reviewer is malicious during the training or evaluation.
 */

const malicious_trainer_ratio = 0.1; // percentage of malicious trainer
const malicious_reviewer_ratio = 0.2; // percentage of malicious reviewer

/**
 * Generate random integer number between min and max
 * @param {number} min minimim number
 * @param {number} max maximum number
 * @returns generated number
 */
function between(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    );
}

function assignMalicious(number_of_clients, ratio) {
    const number_of_malicious = ratio * number_of_clients;
    let malicious_entities = [];

    while (true) {
        const malicious_entity = between(0, number_of_clients - 1);
        if (malicious_entities.includes(malicious_entity) == false) {
            malicious_entities.push(malicious_entity);
            if (malicious_entities.length >= number_of_malicious) break;
        }
    }

    return malicious_entities;
}

function generateTrainScores(malicious_trainers, number_of_clients) {
    let train_results = [];

    for (let i = 0; i < number_of_clients; i++) {
        let score;
        if (malicious_trainers.includes(i)) {
            score = between(95, 100); // malicious client submits almost perfect scores
        } else {
            const random = between(0, 1);
            if (random == 1) score = between(70, 80); // high accuracy client
            else score = between(40, 50); // low accuracy client
        }

        const train_result = {
            client: i,
            score: score,
        }
        train_results.push(train_result);
    }

    return train_results;
}

function generateEvalScores(train_results, malicious_reviewers, malicious_trainers, number_of_clients) {
    let eval_pool = [];

    // reviewer i evaluate trainer j
    for (let i = 0; i < number_of_clients; i++) {
        let eval_results = [];

        for (let j = 0; j < number_of_clients; j++) {
            // cannot evalute itself
            if (i != j) {
                const train_result = train_results[j];
                let score = 0;

                if (malicious_reviewers.includes(i)) {
                    const random = between(0, 1);
                    if (random == 1) {
                        score = between(train_result.score + 20, train_result.score + 30); // submit fake high score
                        if (score > 100) score = 100; // score cannot exceed 100
                    } else {
                        score = between(train_result.score - 30, train_result.score - 20); // submit fake low score
                        if (score < 0) score = 0; // score cannot lower than 0
                    }
                } else {
                    if (malicious_trainers.includes(j)) {
                        score = between(60, 70); // for malicious trainer, assume that the correct score is between 60 and 70
                    } else {
                        score = between(train_result.score - 5, train_result.score + 5);
                    }
                }

                const eval_result = {
                    client: j,
                    score: score,
                }
                eval_results.push(eval_result);
            }
        }

        const reviewer = {
            reviewer: i,
            scores: eval_results
        };
        eval_pool.push(reviewer);
    }



    return eval_pool;
}

function transposeArray(arr) {
    let newArray = [];
    for (let i = 0; i < arr.length; i++) {
        newArray.push([]);
    };

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            newArray[j].push(arr[i][j]);
        };
    };

    return newArray;
}

/**
 * Trim the 0,0 1,1 2,2 ... n,n position from 2D array
 * @param {number} arr array to be trimmed
 */
function trimArray(arr, number_of_clients) {
    let newArray = [];
    for (let i = 0; i < number_of_clients; i++) {
        let newRow = [];
        for (let j = 0; j < number_of_clients; j++) {
            if (i != j) newRow.push(arr[i][j]);
        }
        newArray.push(newRow);
    }

    return newArray;
}

function normalizeArray(arr) {
    let normalized_array = [];
    for (let i = 0; i < arr.length; i++) {
        const max = Math.max.apply(null, arr);
        const min = Math.min.apply(null, arr);
        const normalized = (arr[i] - min) / (max - min);
        normalized_array.push(normalized);
    }

    return normalized_array;
}

function reverseNoramlizeArray(arr) {
    const normalized = normalizeArray(arr);
    let reversed_array = [];
    for (let i = 0; i < normalized.length; i++) {
        const reversed = 1 - normalized[i];
        reversed_array.push(reversed);
    }

    return reversed_array
}

function convert2dTo1d(arr) {
    let newArray = [];
    for (let i = 0; i < arr.length; i++) {
        newArray = newArray.concat(arr[i]);
    }

    return newArray;
}

function convert1dTo2d(arr, number_of_clients) {
    const newArray = [];
    const number_of_element_per_row = number_of_clients - 1;
    while (arr.length) newArray.push(arr.splice(0, number_of_element_per_row));

    return newArray;
}

function getQuantile(arr) { // arr is already sorted
    let median;
    const mid = Math.ceil(arr.length / 2);

    if (arr.length % 2 == 0) {
        median = (arr[mid] + arr[mid - 1]) / 2;
    } else {
        median = arr[mid - 1];
    }

    return median;
}

function getQuarters(arr) {
    let q1, q2, q3, firstHalf, secondHalf;
    arr.sort(function (a, b) {
        return a - b;
    });
    //console.log(arr);

    q2 = getQuantile(arr);

    const mid = Math.ceil(arr.length / 2);
    if (arr.length % 2 == 0) {
        firstHalf = arr.slice(0, mid);
        //console.log(firstHalf);

    } else {
        firstHalf = arr.slice(0, mid - 1);
        //console.log(firstHalf);
    }

    secondHalf = arr.slice(mid);
    //console.log(secondHalf);

    q1 = getQuantile(firstHalf);
    q3 = getQuantile(secondHalf);

    return [q1, q2, q3];
}

function calculateQuartersPerRow(arr) {
    let quarters = [];
    for (let i = 0; i < arr.length; i++) {
        const quarter = getQuarters(arr[i]);
        quarters.push(quarter);
    }

    return quarters;
}

function groupTrainScorePerTrainer(train_results) {
    let results = [];
    for (let i = 0; i < train_results.length; i++) {
        results.push(train_results[i].score);
    }

    return results;
}

function groupEvalScorePerReviewer(eval_pool) {
    let grouped_eval_pool = [];
    for (let i = 0; i < eval_pool.length; i++) {
        const reviewer = eval_pool[i].reviewer;
        const scores = eval_pool[i].scores;

        let grouped = [];
        let counter = 0;
        for (let j = 0; j < scores.length; j++) {
            if (counter == reviewer) grouped.push(0); // fill zeros if client and reviewer is the same
            grouped.push(scores[j].score);
            counter = counter + 1;
            if (reviewer == scores.length && counter == scores.length) grouped.push(0); // fill zeros if client and reviewer is the same
        }

        grouped_eval_pool.push(grouped);
    }

    return grouped_eval_pool;
}

function calculateWeight(arr) {
    console.log("Array:calculate weight ", arr);
    const sum = arr.length > 0 ? arr.reduce((a, b) => a + b): 0;

    let weights = [];
    for (let i = 0; i < arr.length; i++) {
        const weight = arr[i] / Math.min(1,sum);
        weights.push(weight);
    }

    return weights;
}

function calculateTrainerContribution(train_scores, quarters, number_of_clients) {
    let medians = [];
    for (let i = 0; i < number_of_clients; i++) {
        const score = train_scores[i];
        const quarter = quarters[i];
        const iqr = quarter[2] - quarter[0];

        if (score < (quarter[0] - iqr) || score > (quarter[2] + iqr))
            // console.log(`client ${i} submits malicious training scores`);
            medians.push(quarter[1]);
    }
    //   console.log('medians: ', medians);

    const normalized = normalizeArray(medians);
    //   console.log('normalized: ', normalized);

    const weighted = calculateWeight(normalized);
    //   console.log('weighted:', weighted);

    return weighted
}
function calculateReviewerContribution(eval_scores, quarters, number_of_clients) {
    let differences = [];
    for (let i = 0; i < number_of_clients; i++) {
        const scores = eval_scores[i];

        let diffs = [];
        for (let j = 0; j < scores.length; j++) {
            const score = scores[j];
            const quarter = quarters[j];
            const iqr = quarter[2] - quarter[0];

            let diff;
            if (score < (quarter[0] - iqr) && (i != j)) {
                diff = Math.abs((quarter[0] - iqr) - quarter[1]); // set to lower bound limit
                console.log(`reviewer ${i} submits malicious evaluation scores for client ${j} with ${diff}`);

            } else if (score > (quarter[2] + iqr) && (i != j)) {
                diff = Math.abs((quarter[2] + iqr) - quarter[1]); // set to upper bound limit
                console.log(`reviewer ${i} submits malicious evaluation scores for client ${j} with ${diff}`);

            } else {
                diff = Math.abs(score - quarter[1]);
            }

            diffs.push(diff);
        }

        differences.push(diffs);
    }

    console.log('differences with median: ', differences);

    const trimmed = trimArray(differences);
    console.log('trimmed', trimmed);

    const streamlined = convert2dTo1d(trimmed);
    const normalized = reverseNoramlizeArray(streamlined);
    const converted = convert1dTo2d(normalized);
    console.log('flipped and normalized: ', converted);

    let avgs = [];
    for (let i = 0; i < converted.length; i++) {
        const convs = converted[i];
        let total = 0;

        for (let j = 0; j < convs.length; j++) {
            total = total + convs[j];
        }
        const avg = total / convs.length;
        avgs.push(avg);
    }
    console.log('average:', avgs);

    const weighted = calculateWeight(avgs);
    console.log('weighted:', weighted);
}

//---------------------------------------- Runner ----------------------------------------//

async function run(SC, account, number_of_clients, clients) {
    console.log(`================== SETUP ==================`);

    console.log('number of workers: ' + number_of_clients);

    const malicious_trainers = assignMalicious(number_of_clients, malicious_trainer_ratio);
    console.log('malicious trainers list: ');

    const malicious_reviewers = assignMalicious(number_of_clients, malicious_reviewer_ratio);
    console.log('malicious reviewers list: ');

    console.log(`================== TRAINING ==================`);

    const train_results = generateTrainScores(malicious_trainers, number_of_clients);
    console.log(train_results);

    console.log(`================== EVALUATION ==================`);

    const eval_results = generateEvalScores(train_results, malicious_reviewers, malicious_trainers, number_of_clients);
    for (let i = 0; i < eval_results.length; i++) {
        console.log('reviewer ' + (i + 1) + '');
        console.log('scoring ' + (i + 1) + '');
    }

    console.log(`================== CALCULATING TRAINER CONTRIBUTION ==================`);

    const train_scores = groupTrainScorePerTrainer(train_results);
    console.log('train scores per trainer: ');

    const eval_scores = groupEvalScorePerReviewer(eval_results);
    console.log('eval scores per reviewer: ');

    const transposed = transposeArray(eval_scores);
    console.log('eval transposed: ');

    const trimmed = trimArray(transposed, number_of_clients);
    console.log('eval trimmed: ');

    const quarter_per_trainer = calculateQuartersPerRow(trimmed);
    console.log('eval quarter per trainer: ');

    const weights = calculateTrainerContribution(train_scores, quarter_per_trainer, number_of_clients);
    let agg_result = 0;
    for (let i = 0; i < weights.length; i++) {
        // console.log(weights[i] + " * " + train_scores[i])
        agg_result = agg_result + (weights[i] * train_scores[i])
    }
    console.log('aggregation result:')

    for (let i = 0; i < clients.length; i++) {
        await SC.gainExperience.sendTransaction(clients[i].address, { from: account });
        await SC.saveCreditEvent.sendTransaction(clients[i].address, { from: account });
    }

    // console.log(`================== CALCULATING REVIEWER CONTRIBUTION ==================`);

    // calculateReviewerContribution(eval_scores, quarter_per_trainer, number_of_clients);


}
