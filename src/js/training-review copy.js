
exports.doTrainingAndReview = async function (SC, account, iterationCount, mode) {
    var startTime = Date.now()
    let maliciousAccounts = [];
    let bannedAccounts = [];
    let trainers = [];
    let voters = [];
    let accuracyList = [];
    let gweiList = [];
    let totalNonMaliciousVoters = 0;
    let totalMaliciousVoters = 0;
    let totalNonMaliciousTrainers = 0;
    let totalMaliciousTrainers = 0;
    let totalTrainers = 0;
    let totalVoters = 0;
    let totalBannedVoters = 0;
    let totalBannedTrainers = 0;
    let trainerScores = [];

    await SC.calculateReputation.sendTransaction({ from: account });
    let candidatesCount = await SC.candidatesCount();
    candidatesCount = candidatesCount.toNumber();
    let globalAccuracy = await SC.globalAccuracy();
    globalAccuracy = globalAccuracy.toNumber();
    console.log("Global accuracy: ", globalAccuracy, "");
    let processTimes = [];
    var totalAddCandidateTime = 0;
    
    for (let i = 0; i < candidatesCount; i++) {

        var startAddCandidate = Date.now()
        let address = await SC.addressList(i);

        let candidate = await SC.candidates(address);
        //   console.log(candidate);
        const randomValue = Math.max(0, Math.min(100, Math.floor(Math.random() * 6) + globalAccuracy));
        const randomValueMalicious = Math.max(0, Math.min(Math.floor(Math.random() * 6) + globalAccuracy - 5));
        maliciousAccounts.push(candidate.isMalicious);
        if (candidate.isBanned)
            bannedAccounts.push(i);
        let accuracy = 0;
        if (candidate.isTrainer) {
            if (maliciousAccounts[i])
                accuracy = randomValueMalicious;
            else
                accuracy = randomValue;
            if (candidate.isMalicious) totalMaliciousTrainers++
            else totalNonMaliciousTrainers++
            totalTrainers++
            trainers.push({ addr: address, accuracy: accuracy, reputation: candidate.reputation.toNumber(), isMalicious: candidate.isMalicious, candidateId: i });

            if (candidate.isBanned)
                totalBannedTrainers++;
        }
        if (candidate.isVoter) {
            voters.push({ addr: address, votes: [], reputation: candidate.reputation.toNumber(), isMalicious: candidate.isMalicious, candidateId: i })

            if (candidate.isMalicious) totalMaliciousVoters++
            else totalNonMaliciousVoters++
            totalVoters++
            if (candidate.isBanned)
                totalBannedVoters++;
        }
        accuracyList.push(accuracy);
        gweiList.push(candidate.totalGwei);
        totalAddCandidateTime += (Date.now() - startAddCandidate);
    }

    let nHighest = Math.round(totalTrainers / 2);
    console.log({ nHighest })
    for (let i = 0; i < totalVoters; i++) {
        voters[i].evals = Array.from({ length: totalTrainers }, (_, i) => Math.max(0, Math.min(100, Math.floor(Math.random() * 6) + globalAccuracy))
        );

    }

    totalAddCandidateTime /= candidatesCount;
    processTimes.push(totalAddCandidateTime);
    console.log("Voting based on accuracy..")

    for (let i = 0; i < totalTrainers; i++) {
        trainerScores.push(0);

    }

    let nHighestAccuracy = getNHighest(accuracyList, nHighest);
    console.log("Total voters:", voters.length);
    console.log("Evaluating..")
    for (let i = 0; i < voters.length; i++) {
        if (!bannedAccounts[voters[i].candidateId]) {
            for (let j = 0; j < trainers.length; j++) {
                if (!bannedAccounts.includes([trainers[j].candidateId])) {
                    // console.log("Trainer found:",trainers[j].candidate.isTrainer);
                    let voteValue = 1;
                    if (!voters[i].isMalicious) {
                        if (isBetween(voters[i].evals[j] - 5, trainers[j].accuracy, voters[i].evals[j] + 5)) {
                            voteValue = voters[i].reputation;
                            voters[i].votes.push(j);
                        }
                    } else {
                        if (trainers[j].isMalicious) {
                            voteValue = voters[i].reputation;
                            voters[i].votes.push(j);
                        } else {
                            if (isBetween(voters[i].evals[j] - 5, trainers[j].accuracy, voters[i].evals[j] + 5)) {
                                voteValue = voters[i].reputation;
                                voters[i].votes.push(j);
                            }
                        }
                    }
                    trainerScores[j] += parseInt(voteValue);

                }
            }
        }


    }

    console.log("Voting..")
    for (let i = 0; i < voters.length; i++) {
        if (!bannedAccounts.includes(voters[i].candidateId)) {
            for (let j = 0; j < trainers.length; j++) {
                if (!bannedAccounts.includes([trainers[j].candidateId])) {
                    // console.log("Trainer found:",trainers[j].candidate.isTrainer);

                    if (!voters[i].isMalicious && !trainers[j].isMalicious && nHighestAccuracy.includes(j)) {
                        voters[i].votes.push(j);
                        trainerScores[j] = trainerScores[j] + voters[i].reputation;
                    } else if (!voters[i].isMalicious && trainers[j].isMalicious) {
                        voters[i].votes.push(j);
                        trainerScores[j] = trainerScores[j] + voters[i].reputation;
                    } else {
                        voters[i].votes.push(j);
                        trainerScores[j] = trainerScores[j] + voters[i].reputation;
                    }
                }
            }
        }


    }

    console.log("Selecting highest scores..")
    //get highest scores 
    let punishList = [];
    if (iterationCount > 0) {
        let nHighestScores = getNHighest(trainerScores, nHighest);
        printNHighest(trainerScores, nHighestScores, trainers, nHighest);
        globalAccuracy = aggregate(trainerScores, nHighestScores, trainers, nHighest);
        console.log("Global accuracy averaged: ", globalAccuracy)

        // console.log("Check voters who vote on lower scores and trainers with low accuracy..");
        for (let i = 0; i < trainers.length; i++) {
            if (!bannedAccounts[trainers[i].candidateId]) {
                if (trainers[i].accuracy < trainers[nHighestScores[nHighest - 1]].accuracy) {
                    punishList.push(i);
                }
            }
        }
        for (let i = 0; i < voters.length; i++) {
            if (!bannedAccounts.includes(voters[i].candidateId)) {
                for (let j = 0; j < punishList.length; j++) {
                    if (!punishList.includes(voters[i].candidateId) && voters[i].votes.includes(j)) {
                        punishList.push(i);
                    }
                }
            }
        }
        console.log("Calculating trainers reputation..");


        for (let i = 0; i < trainers.length; i++) {
            if (!bannedAccounts[i]) {
                if (punishList.includes(i)) {
                    // console.log(trainers[i])
                    await SC.setReputation.sendTransaction(trainers[i].addr, trainers[i].reputation - 10, { from: account });

                    trainers[i].reputations -= 10
                } else {
                    // console.log(trainers[i])
                    // if(!maliciousAccounts[i])
                    // reputations[i] = reputations[i] + 10
                    await SC.setReputation.sendTransaction(trainers[i].addr, trainers[i].reputation + 10, { from: account });

                    trainers[i].reputations -= 10
                }
                let newGwei = Math.round(parseInt(gweiList[i]) + parseInt(gweiList[i] * trainers[i].reputation / 1000));
                // console.log(newGwei)
                gweiList[i] = newGwei;
                await SC.setGwei.sendTransaction(trainers[i].addr, newGwei, { from: account });
            }


        }
    }
    console.log("Calculating voters reputation..");


    if (iterationCount > 0) {
        for (let i = 0; i < voters.length; i++) {
            if (!bannedAccounts.includes(voters[i].candidateId)) {
                if (punishList.includes(i)) {
                    await SC.setReputation.sendTransaction(voters[i].addr, voters[i].reputation - 10, { from: account });

                    voters[i].reputation = voters[i].reputation - 10
                } else {
                    await SC.setReputation.sendTransaction(voters[i].addr, voters[i].reputation + 10, { from: account });

                    voters[i].reputation = voters[i].reputation + 10
                }

                let newGwei = Math.round(parseInt(gweiList[i]) + parseInt(gweiList[i] * voters[i].reputation / 1000));
                // console.log(newGwei)
                gweiList[i] = newGwei;
                await SC.setGwei.sendTransaction(voters[i].addr, newGwei, { from: account });
            }

        }
    }
    console.log("Setting new accuracy..");
    console.log("Global accuracy: ", globalAccuracy);
    await SC.setGlobalAccuracy.sendTransaction(globalAccuracy.toFixed(0), { from: account });
    console.log("Finish iteration, returning values");

    var endTime = Date.now()

    var perfTime = endTime - startTime;
    console.log(`doTraining takes ${perfTime} milliseconds`)
    let averageReputation = { mv: 0, nmv: 0, mt: 0, nmt: 0 };
    let totalReputation = { mv: 0, nmv: 0, mt: 0, nmt: 0 };
    let reputationArr = { mv: [], nmv: [], mt: [], nmt: [] }
    let averageGwei = { mv: 0, nmv: 0, mt: 0, nmt: 0 };
    for (let i = 0; i < totalTrainers; i++) {
        if (trainers[i].isMalicious) {

            averageReputation.mt += trainers[i].reputation / totalMaliciousVoters;
            totalReputation.mt += trainers[i].reputation;
            reputationArr.mt.push(trainers[i].reputation);
            averageGwei.mt += gweiList[i] / totalMaliciousVoters;
        } else {

            averageReputation.nmt += trainers[i].reputation / totalNonMaliciousVoters;
            totalReputation.nmt += trainers[i].reputation;
            reputationArr.nmt.push(trainers[i].reputation);
            averageGwei.nmt += gweiList[i] / totalNonMaliciousVoters;

        }

    }
    for (let i = 0; i < totalVoters; i++) {
        if (voters[i].isMalicious) {

            averageReputation.mv += voters[i].reputation / totalMaliciousVoters;
            totalReputation.mv += voters[i].reputation;
            reputationArr.mv.push(voters[i].reputation);
            averageGwei.mv += gweiList[i] / totalMaliciousVoters;
        } else {

            averageReputation.nmv += voters[i].reputation / totalMaliciousVoters;
            totalReputation.nmv += voters[i].reputation;
            reputationArr.nmv.push(voters[i].reputation);
            averageGwei.nmv += gweiList[i] / totalMaliciousVoters;
        }

        // const FileSystem = require("fs");
        // FileSystem.writeFile('error.json', "iteration " + i, (error) => {
        //    if (error) throw error;
        //  });
    }

    return perfTime;
}


function getNHighest(intArr, n) {

    let indexArr = Array.from({ length: intArr.length }, (_, i) => i);
    //1) combine the arrays:
    var list = [];
    for (var j = 0; j < indexArr.length; j++)
        list.push({ 'index': indexArr[j], 'int': intArr[j] });

    //2) sort:
    list.sort(function (a, b) {
        return ((a.int > b.int) ? -1 : ((a.int == b.int) ? 0 : 1));
        //Sort could be modified to, for example, sort on the age 
        // if the name is the same. See Bonus section below
    });

    //3) separate them back out:
    for (var k = 0; k < list.length; k++) {
        indexArr[k] = list[k].index;
        intArr[k] = list[k].int;
    }
    return indexArr.slice(0, n);

}
function printNHighest(scores, highest, trainers, n) {
    console.log("Score list:", scores)
    for (let i = 0; i < n; i++) {
        console.log((i + 1) + ". Candidate " + (highest[i] + 1) + ", score : " + scores[highest[i]] + ", accuracy : " + trainers[highest[i]].accuracy);

    }

}
function isBetween(low, value, upper) {
    var min = Math.min.apply(Math, [low, upper]),
        max = Math.max.apply(Math, [low, upper]);
    return value > min && value < max;
}
function aggregate(scores, highest, trainers, n) {
    let totalScores = 0;
    for (let i = 0; i < n; i++) {
        totalScores += scores[highest[i]];

    }
    let totalAccuracy = 0;
    for (let i = 0; i < n; i++) {
        console.log(scores[highest[i]] + " / " + totalScores + " * " + trainers[highest[i]].accuracy);
        let weight = (scores[highest[i]] / totalScores) * trainers[highest[i]].accuracy;
        console.log(weight)
        totalAccuracy = totalAccuracy + weight;
    }
    return totalAccuracy;
}

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    );
}

function generateTrainScores(malicious_trainers, start_value, end_value) {
    let train_results = [];
  
    for (let i = 0; i < number_of_clients; i++) {
      let score;
      if (malicious_trainers.includes(i)) {
        score = between(end_value, end_value); // malicious client submits almost perfect scores
      } else {
        const random = between(0, 1);
        if (random == 1) score = between(start_value, end_value); // high accuracy client
        else score = between(start_value, end_value); // low accuracy client
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
function trimArray(arr) {
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

function convert1dTo2d(arr) {
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
    const sum = arr.reduce((a, b) => a + b);

    let weights = [];
    for (let i = 0; i < arr.length; i++) {
        const weight = arr[i] / sum;
        weights.push(weight);
    }

    return weights;
}

function calculateTrainerContribution(train_scores, quarters) {
    let medians = [];
    for (let i = 0; i < number_of_clients; i++) {
        const score = train_scores[i];
        const quarter = quarters[i];
        const iqr = quarter[2] - quarter[0];

        if (score < (quarter[0] - iqr) || score > (quarter[2] + iqr)) console.log(`client ${i} submits malicious training scores`);
        medians.push(quarter[1]);
    }
    console.log('medians: ', medians);

    const normalized = normalizeArray(medians);
    console.log('normalized: ', normalized);

    const weighted = calculateWeight(normalized);
    console.log('weighted:', weighted);

    return weighted
}

function calculateReviewerContribution(eval_scores, quarters) {
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
