let map;
let mrk_widget;

const quizData = [
    {
        question: "「漁生浦」の読み方は？",
        options: ["ぎょせいうら", "いさりうら", "りょうせうら"],
        correctAnswer: "りょうせうら"
    },
    {
        question: "「薩摩川内」の読み方は？",
        options: ["さつませんだい", "さつまかわうち", "さつまがわない"],
        correctAnswer: "さつませんだい"
    },
    {
        question: "「弓削」の読み方は？",
        options: ["ゆげ", "きゅうさく", "ゆみきり"],
        correctAnswer: "ゆげ"
    },
    {
        question: "「軍ヶ浦」の読み方は？",
        options: ["ぐんがうら", "ぐんかうら", "いくさがうら"],
        correctAnswer: "いくさがうら"
    },
    {
        question: "「糸島」の読み方は？",
        options: ["いとしま", "いとじま", "しじま"],
        correctAnswer: "いとしま"
    },
    {
        question: "「定留」の読み方は？",
        options: ["さだのみ", "さだとめ", "ていりゅう"],
        correctAnswer: "さだのみ"
    },
    {
        question: "「頭集」の読み方は？",
        options: ["とうしゅう ", "かしらつどい", "あたまあつめ"],
        correctAnswer: "かしらつどい"
    },
    {
        question: "「油須原」の読み方は？",
        options: ["あぶらすはら", "ゆすばる", "ゆすはら"],
        correctAnswer: "ゆすばる"
    },
    {
        question: "「五ヶ瀬」の読み方は？",
        options: ["ごかせ", "いつかせ", "ごがせ"],
        correctAnswer: "ごかせ"
    },
    {
        question: "「指宿」の読み方は？",
        options: ["さしぶつ", "いぶすき", "ゆびふく"],
        correctAnswer: "いぶすき"
    },
    // 他の問題を追加...
];

let currentQuiz = 0;

function loadQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    const quiz = quizData[currentQuiz];
    
    quizContainer.innerHTML = `
        <h2>問題 ${currentQuiz + 1}</h2>
        <p>${quiz.question}</p>
        <div class="button-group">
            ${quiz.options.map(option => `<button onclick="checkAnswer('${option}')">${option}</button>`).join('')}
        </div>
    `;
}

ZMALoader.setOnLoad(function (mapOptions, error) {
    if (error) {
        console.error(error);
        return;
    }

    const lat = 35.681406, lng = 139.767132;
    const mapElement = document.getElementById('ZMap');

    mapOptions.center = new ZDC.LatLng(lat, lng);
    mapOptions.zipsMapType = 'kP8KjZdn';
    mapOptions.mouseWheelReverseZoom = true;

    map = new ZDC.Map(
        mapElement,
        mapOptions,
        function() {
            map.addControl(new ZDC.ZoomButton('bottom-right', new ZDC.Point(-20, -35)));
            map.addControl(new ZDC.Compass('top-right'));
            map.addControl(new ZDC.ScaleBar('bottom-left'));
        },
        function() {
            console.error('Map initialization failed');
        }
    );

    loadQuiz();
});

async function checkAnswer(selectedAnswer) {
    const correctAnswer = quizData[currentQuiz].correctAnswer;
    if (selectedAnswer === correctAnswer) {
        await searchAddress(correctAnswer);
        document.getElementById('correct-answer').textContent = correctAnswer;
        document.getElementById('result').classList.remove('hidden');
        
        currentQuiz++;
        if (currentQuiz < quizData.length) {
            setTimeout(() => {
                // 東京駅の中心地に移動
                const tokyoStationLatLng = new ZDC.LatLng(35.681406, 139.767132);
                map.setCenter(tokyoStationLatLng);
                
                // マーカーを削除
                if (mrk_widget) {
                    map.removeWidget(mrk_widget);
                }
                
                // 結果表示を隠す
                document.getElementById('result').classList.add('hidden');
                
                // 次のクイズを読み込む
                loadQuiz();
            }, 5000); // 5秒後に実行
        } else {
            // クイズ終了時の処理
            setTimeout(() => {
                document.getElementById('quiz-container').innerHTML = '<h2>クイズ終了！お疲れ様でした。</h2>';
                document.getElementById('top-button').classList.remove('hidden');
                document.getElementById('result').classList.add('hidden');
            }, 5000); // 5秒後に実行
        }
    } else {
        alert('不正解です。もう一度試してください。');
    }
}

function returnToFirstQuestion() {
    currentQuiz = 0;
    loadQuiz();
    document.getElementById('top-button').classList.add('hidden');
    document.getElementById('result').classList.add('hidden');
    const tokyoStationLatLng = new ZDC.LatLng(35.681406, 139.767132);
    map.setCenter(tokyoStationLatLng);
    if (mrk_widget) {
        map.removeWidget(mrk_widget);
    }
}


async function searchAddress(address) {
    try {
        const response = await fetch('https://test-web.zmaps-api.com/search/address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-api-key': 'gkZZ5thvD128fdg5OFYGa4nhJCctGemb9FKvZWx3',
                'Authorization': 'referer'
            },
            body: new URLSearchParams({
                word: address,
                word_match_type: '3',
                address_level: 'SHK,OAZ',
                sort:'address_read'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "OK" && data.result.info.hit > 0) {
            const location = data.result.item[0].position;
            const lng = location[0];
            const lat = location[1];
            const latLng = new ZDC.LatLng(lat, lng);

            map.setCenter(latLng);

            if (mrk_widget) {
                map.removeWidget(mrk_widget);
            }

            // 可愛い「〇」マーカーを作成
            mrk_widget = new ZDC.Marker(
                new ZDC.LatLng(lat, lng),
                {
                    custom: {
                        base: {
                            imgSrc: './img/correct.png',
                            imgPos: new ZDC.Point(-30,0),
                            imgSize: new ZDC.Point(100,100),
                        }
                    }
                }
            );
            /* ★マーカーを追加 */
            map.addWidget(mrk_widget);

            document.getElementById("result-address").textContent = data.result.item[0].address;
            document.getElementById("result-address_read").textContent = data.result.item[0].address_read;
            document.getElementById("result-lat").textContent = lat;
            document.getElementById("result-lng").textContent = lng;

            // 地図の移動とマーカーの追加が完了したことを示すPromiseを返す
            return new Promise(resolve => {
                setTimeout(resolve, 2000); // 2秒待機して地図の表示を確認
            });
        } else {
            alert("住所の位置情報が見つかりませんでした");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
        alert("住所の検索中にエラーが発生しました");
    }
}

