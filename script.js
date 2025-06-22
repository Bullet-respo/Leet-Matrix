document.addEventListener('DOMContentLoaded', function () {
    const searchbutton = document.getElementById('Search-btn');
    const usernameInput = document.getElementById('user-input');
    const statsContainer = document.querySelector('.stats-container');
    const statsCard = document.querySelector('.stats-card');
    const easyProgressCircle = document.querySelector('.easy-progress');
    const mediumProgressCircle = document.querySelector('.medium-progress');
    const hardProgressCircle = document.querySelector('.hard-progress');
    const easylabel = document.getElementById('easy-label');
    const mediumlabel = document.getElementById('medium-label');
    const hardlabel = document.getElementById('hard-label');

    // returns true or false according to usernmae validation based on a regex
    function validateUsername(username) {
        if (username.trim() === "") {
            alert('Username should not be Empty');
            return false;
        }
        const regex = /^(?![_-])(?!.*[_-]{2})[a-zA-Z0-9_-]{3,16}(?<![_-])$/;
        const isMatching = regex.test(username);
        // If username is invalid or isMatching = False
        if (!isMatching) {
            alert('Invalid Username');
        }
        return isMatching;

    }

    async function fetchUserDetails(username) {
        try {
            searchbutton.textContent = 'Searching...';
            searchbutton.disabled = true;
            // alternate API
            // const URL = `https://leetcode-stats-api.herokuapp.com/ ${username}`;

            //FakeProxy gotton from https://cors-anywhere.herokuapp.com/corsdemo
            // const proxyURL = 'https://cors-anywhere.herokuapp.com/';
            const URL = `https://leetcode.com/graphql/`;
            const myheader = new Headers();
            myheader.append('content-type', 'application/json');
            const graphql = JSON.stringify({
                query: `
                query userSessionProgress($username: String!) {
                    allQuestionsCount {
                    difficulty
                    count
                    }
                    matchedUser(username: $username) {
                    submitStats {
                        acSubmissionNum {
                        difficulty
                        count
                        submissions
                        }
                        totalSubmissionNum {
                        difficulty
                        count
                        submissions
                        }
                    }
                    }
                }`,
                variables: {
                username: username
                }

            })

            const requestOptions = {
                method: 'post',
                headers: myheader,
                body: graphql,
                // redirect:'follow'
            }

            const response = await fetch(URL, requestOptions);
            if (!response.ok) {
                throw new Error('Unable to fetch the User Details');
            }
            const parseddata = await response.json();
            console.log('Logging Data: ', parseddata);

            displayUserData(parseddata);
        }

        catch (error) {
            statsContainer.innerHTML = '<p>No data found</p>';
            console.log('Caught error: ',error)
        }

        finally {
            searchbutton.textContent = 'Search';
            searchbutton.disabled = false;
        }

    }

    function updateProgress(solved,total,label,circle){
        const progressPercentage = (solved/total)*100;

        console.log(`Progress Percntage is ${progressPercentage}`);
        
        circle.style.setProperty('--progress-degree', `${progressPercentage}%`);

        circle.style.background = `conic-gradient(
            green ${progressPercentage}%,
            #283a2e 0%
          )`;

        label.textContent= `${solved}/${total}`;
    }

    function displayUserData(parseddata){
        const totalQuestions = parseddata.data.allQuestionsCount[0].count;
        console.log('Total Questions: ', totalQuestions);
        const totalEasyQuestions = parseddata.data.allQuestionsCount[1].count;
        console.log('Total Easy Questions: ', totalEasyQuestions);
        const totalMediumQuestions = parseddata.data.allQuestionsCount[2].count;
        console.log('Total Medium Questions: ', totalMediumQuestions);
        const totalHardQuestions = parseddata.data.allQuestionsCount[3].count;
        console.log('Total Hard Questions: ', totalHardQuestions);

        const totalSolvedQuestions = parseddata.data.matchedUser.submitStats.acSubmissionNum[0].count;
        console.log('Total Solved Questions: ', totalSolvedQuestions);
        const totalEasySolvedQuestions = parseddata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        console.log('Total Easy Solved Questions: ', totalEasySolvedQuestions);
        
        const totalMediumSolvedQuestions = parseddata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        console.log('Total Medium Solved Questions: ', totalMediumSolvedQuestions);
        const totalHardSolvedQuestions = parseddata.data.matchedUser.submitStats.acSubmissionNum[3].count;
        console.log('Total Hard Solved Questions: ', totalHardSolvedQuestions);

        updateProgress(totalEasySolvedQuestions, totalEasyQuestions,easylabel,easyProgressCircle);

        updateProgress(totalMediumSolvedQuestions, totalMediumQuestions,mediumlabel,mediumProgressCircle);

        updateProgress(totalHardSolvedQuestions, totalHardQuestions,hardlabel,hardProgressCircle);

        const cardsData = [
            {label: "Overall Submissions", value: parseddata.data.matchedUser.submitStats.acSubmissionNum[0].submissions },
            {label: "Overall Easy Submissions", value: parseddata.data.matchedUser.submitStats.acSubmissionNum[1].submissions },
            {label: "Overall Medium Submissions", value: parseddata.data.matchedUser.submitStats.acSubmissionNum[2].submissions },
            {label: "Overall Hard Submissions", value: parseddata.data.matchedUser.submitStats.acSubmissionNum[3].submissions },
            
        ]

        console.log('card data: ', cardsData);

        statsCard.innerHTML = cardsData.map( data => 
                   ` <div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                    </div> `
        ).join('')
    }

    searchbutton.addEventListener('click', function () {
        // Cheking the value of user-input                        
        const username = usernameInput.value;
        console.log('Logging username:', username);

        if (validateUsername(username)) { // If Username is valid then fetchUserdetails()
            fetchUserDetails(username);

        }
    })
})
