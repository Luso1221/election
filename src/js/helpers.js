exports.doTraining = async function (SC, account) {
    let voterAccounts = [];
    let maliciousAccounts = [];
    let bannedAccounts = [];
    let candidates = [];
    let voters = [];
    let reputations = [];
    let candidateAccounts = [];
    let accuracyList = [];
    let gweiList = [];
    let totalVoters = 5;
    let totalMaliciousVoters = 5;
    let totalTrainers = 30;
    let totalMaliciousTrainers = 10;
    // let number_of_trainers_selected = 3;

    await SC.calculateReputation.sendTransaction({ from: account });
    let candidatesCount = await SC.candidatesCount();
    let globalAccuracy = await SC.globalAccuracy(); globalAccuracy = globalAccuracy.toNumber();
    console.log("Global accuracy: ", globalAccuracy);
    candidatesCount = candidatesCount.toNumber();

    console.log("Setting trainers..")
    for (let i = 0; i < candidatesCount; i++) {
        let address = await SC.addressList(i);

        let candidate = await SC.candidates(address);
        //   console.log(candidate);
        const randomValue = Math.random() * (globalAccuracy + 1 - globalAccuracy) + globalAccuracy;
        const randomValueMalicious = Math.random() * (globalAccuracy - 3 - globalAccuracy - 5) + globalAccuracy - 5;

        bannedAccounts.push(candidate.isBanned);
        maliciousAccounts.push(candidate.isMalicious);
        voterAccounts.push(candidate.isVoter);
        reputations.push(candidate.reputation.toNumber());

        let accuracy = 0;
        if (!candidate.isVoter) {
            if (bannedAccounts[i])
                accuracy = 0;
            else if (maliciousAccounts[i])
                accuracy = randomValueMalicious;
            else
                accuracy = randomValue;
            candidates.push({ candidate: candidate, accuracy: accuracy, reputation: candidate.reputation });
            voters.push({})
            candidateAccounts.push(i);
        }
        else {
            candidates.push({})
            voters.push({ voter: candidate, votes: [], reputation: candidate.reputation })

        }
        accuracyList.push(accuracy);
        gweiList.push(candidate.totalGwei);
        //   console.log(candidates[i-1]);

        // log(candidates[indexArray].accuracy);
    }

    console.log("Voting based on accuracy..")

    let candidateScores = [];
    for (let i = 0; i < candidatesCount; i++) {
        candidateScores.push(0);
    }

    console.log("Selecting highest scores..")
    //get highest scores 
    let threeHighestAccuracy = getThreeHighest(accuracyList);
    for (let i = 0; i < voters.length; i++) {
        if (!bannedAccounts[i] && voterAccounts[i]) {
            for (let j = 0; j < candidates.length; j++) {
                if (!bannedAccounts[j] && !voterAccounts[j]) {
                    if (maliciousAccounts[i] && maliciousAccounts[j]) {
                        voters[i].votes.push(j);
                        candidateScores[j] = candidateScores[j] + voters[i].reputation.toNumber();
                    }
                    else if (!maliciousAccounts[i] && !maliciousAccounts[j] && threeHighestAccuracy.includes(j)) {
                        voters[i].votes.push(j);
                        candidateScores[j] = candidateScores[j] + voters[i].reputation.toNumber();
                    }
                }
            }
        }

    }

    console.log("Selecting highest scores..")
    //get highest scores 
    let threeHighestScores = getThreeHighest(candidateScores);
    console.log("1. Candidate " + threeHighestScores[0] + ", accuracy : " + candidates[threeHighestScores[0]].accuracy);
    console.log("2. Candidate " + threeHighestScores[1] + ", accuracy : " + candidates[threeHighestScores[1]].accuracy);
    console.log("3. Candidate " + threeHighestScores[2] + ", accuracy : " + candidates[threeHighestScores[2]].accuracy);
    globalAccuracy = (candidates[threeHighestScores[0]].accuracy + candidates[threeHighestScores[1]].accuracy + candidates[threeHighestScores[2]].accuracy) / 3;
    console.log("Global accuracy averaged: ", globalAccuracy)

    console.log("Check voters who vote on lower scores and trainers with low accuracy..");
    let punishList = [];
    for (let i = 0; i < candidates.length; i++) {
        if (!bannedAccounts[i] && !voterAccounts[i]) {
            if (candidates[i].accuracy < candidates[threeHighestAccuracy[2]].accuracy) {
                punishList.push(i);
            }
        }
    }
    for (let i = 0; i < voterAccounts.length; i++) {
        if (!bannedAccounts[i] && voterAccounts[i]) {
            for (let j = 0; j < punishList.length; j++) {
                if (!punishList.includes(i) && voters[i].votes.includes(punishList[j])) {
                    punishList.push(i);
                }
            }
        }
    }
    console.log("Calculating candidates reputation..");
    for (let i = 0; i < candidates.length; i++) {
        if (!bannedAccounts[i]) {
            if (!voterAccounts[i]) {
                if (punishList.includes(i)) {
                    console.log(candidates[i])
                    await SC.setReputation.sendTransaction(candidates[i].candidate.addr, candidates[i].reputation.toNumber() - 10, { from: account });

                    reputations[i] = reputations[i] - 10
                } else {
                    console.log(candidates[i])
                    await SC.setReputation.sendTransaction(candidates[i].candidate.addr, candidates[i].reputation.toNumber() + 10, { from: account });

                    reputations[i] = reputations[i] + 10
                }
                let newGwei = Math.round(parseInt(gweiList[i]) + parseInt(gweiList[i] * reputations[i] / 1000));
                console.log(newGwei)
                gweiList[i] = newGwei;
                await SC.setGwei.sendTransaction(candidates[i].candidate.addr, newGwei, { from: account });
            }
        }


    }
    console.log("Calculating voters reputation..");
    for (let i = 0; i < voters.length; i++) {
        if (!bannedAccounts[i] && voterAccounts[i]) {
            if (punishList.includes(i)) {
                await SC.setReputation.sendTransaction(voters[i].voter.addr, voters[i].reputation.toNumber() - 10, { from: account });

                reputations[i] = reputations[i] - 10
            } else {
                await SC.setReputation.sendTransaction(voters[i].voter.addr, voters[i].reputation.toNumber() + 10, { from: account });

                reputations[i] = reputations[i] + 10
            }

            let newGwei = Math.round(parseInt(gweiList[i]) + parseInt(gweiList[i] * reputations[i] / 1000));
            console.log(newGwei)
            gweiList[i] = newGwei;
            await SC.setGwei.sendTransaction(voters[i].voter.addr, newGwei, { from: account });
        }

    }
    console.log("Setting new accuracy..");
    await SC.setGlobalAccuracy.sendTransaction(globalAccuracy.toFixed(0), { from: account });
    console.log("Finish iteration, returning values");

    let averageReputation = { mv: 0, nmv: 0, mt: 0, nmt: 0 };
    let averageGwei = { mv: 0, nmv: 0, mt: 0, nmt: 0 };
    for (let i = 0; i < reputations.length; i++) {
        if (maliciousAccounts[i] && voterAccounts[i]) {

            averageReputation.mv += reputations[i] / totalMaliciousVoters;
            averageGwei.mv += gweiList[i] / totalMaliciousVoters;
        } else if (maliciousAccounts[i]) {
            averageReputation.mt += reputations[i] / totalMaliciousTrainers;
            averageGwei.mt += gweiList[i] / totalMaliciousTrainers;
        } else if (voterAccounts[i]) {

            averageReputation.nmv += reputations[i] / totalVoters;
            averageGwei.nmv += gweiList[i] / totalVoters;

        } else if (!maliciousAccounts[i] && !voterAccounts[i]) {

            averageReputation.nmt += reputations[i] / totalTrainers;
            averageGwei.nmt += gweiList[i] / totalTrainers;
        }

    }
    return { candidatesCount, candidates, voters, candidateScores, punishList, bannedAccounts, maliciousAccounts, voterAccounts, threeHighestAccuracy, threeHighestScores, reputations, averageReputation, averageGwei, globalAccuracy, gweiList };
}

function getThreeHighest(intArr) {

    let highest1 = -1;
    let highest2 = -1;
    let highest3 = -1;

    for (let i = 0; i < intArr.length; i++) {

        if (highest1 == -1 || intArr[i] > intArr[highest1]) {
            highest3 = highest2;
            highest2 = highest1;
            highest1 = i;
        } else if (highest2 == -1 || intArr[i] > intArr[highest2]) {
            highest3 = highest2;
            highest2 = i;
        } else if (highest3 == -1 || intArr[i] > intArr[highest3]) {
            highest3 = i;
        }
    }
    return [highest1, highest2, highest3];
}