(function() {
    functionr(method, url, header, sen) {
        returnnewPromise(function(resolve, reject) {
            varxhr = newXMLHttpRequest();
            xhr.open(method, url);
            //ADDHEADERSHERE
            if (header) {
                varhe = Object.entries(header);
                for (vari = 0; i < he.length; i++) {
                    xhr.setRequestHeader(he[i][0], he[i][1])
                }
            }
            xhr.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function() {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send(sen);
        });
    }

    if (window.location.origin != "https://membean.com") {
        window.location.replace("https://membean.com/dashboard#");
    }
    elseif(!window.location.href.includes("training_sessions")) {
        varnewSessionTime = NaN;
        while (isNaN(newSessionTime)) {
            newSessionTime = parseInt(window.prompt("Howlongdoyouwantyournewsessiontobe?\nThiscanonlybeanumber,inminutes.", "15"));
            if (isNaN(newSessionTime)) { window.alert("Thatisnotavalidtime."); }
        }
        r("POST", `https://membean.com/training_sessions?t=${newSessionTime}`).then((res) => {
            varid = newDOMParser().parseFromString(res, "text/html").querySelector("#done-btn__id").value;
            window.location.replace(`https://membean.com/training_sessions/${id}/user_state`);
        });
    }
    elseif(!window.MBActive) {
        window.MBActive = true;
        var percent = Math.random() * 0.25 + 0.70;
        var rTimeRange = (Math.random() / 5) + 0.4;
        var oldGrowl = MB.growl;

        MB.growl = (msg) => {
            oldGrowl(msg);
            console.log(msg);
            if (["Study", "Restudy", "Review", "Learn"].includes(msg)) {
                window.setTimeout(() => {
                    try {
                        varm = this.window.Ext.select("#choice-section.choice");
                        for (vari = 0; i < 2; i++) {
                            varf = m.item(i);
                            if (f) {
                                this.window.simulate(f.dom, "click");
                            }
                        }
                    } catch (err) {}

                    try {
                        window.q.formInput.dom.value = window.q.answer.substr(window.q.firstLetterCorrection, window.q.answer.length - window.q.firstLetterCorrection);
                        constevent = newKeyboardEvent("keyup", {
                            key: "Enter",
                        });
                        window.q.formInput.dom.dispatchEvent(event);
                    } catch (err) {}
                    varc = this.window.Ext.get("next-btn") || this.window.Ext.get("Proceed");
                    if (c) {
                        this.window.simulate(c.dom, "click");
                    }
                }, 10000 + ((Math.random() * 10000) - 5000));
            } else {
                varintervalCheck = setInterval(() => {
                    if (q.timer.pbar.value >= rTimeRange) {
                        try {
                            window.q.choiceEls.each(function(b) {
                                if (window.q.correctChoice(b)) {
                                    b.addClass("correct");
                                } else {
                                    b.addClass("wrong");
                                }
                            });
                        } catch (err) {}
                        try {
                            window.q.formInput.dom.value = window.q.answer.substr(window.q.firstLetterCorrection, window.q.answer.length - window.q.firstLetterCorrection);
                            constevent = newKeyboardEvent("keyup", {
                                key: "Enter",
                            });

                            window.q.formInput.dom.dispatchEvent(event);
                        } catch (err) {}
                        window.q.fireEvent((Math.random() <= percent) ? "correct" : "incorrect");
                        clearTimeout(intervalCheck);
                    }
                }, 500);
            }
            setTimeout(() => { try { document.querySelector("#Click_me_to_stop").click(); } catch (err) {} }, 10000);
        };

        MB.growl("Started!");
    }

})()