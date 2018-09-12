/*!
 * Zeit DNS Panel (unofficial) | index.js
 * Author: SukkaW
 * Link: https://github.com/SukkaW/zeit-world-panel
 * License: GPL-3.0
 */

/*
 * Set Variables
 */

var apikey = localStorage.getItem('token');
var username = localStorage.getItem('username');
var apiendpoint = localStorage.getItem('api');

/*
 * localStorage Helper
 */
function setLS(key, value) {
    try {
        localStorage.setItem(key, value)
    } catch (o) {
        console.log(o), console.log("Failed to set localStorage item")
    }
}

/*
 * Refrash Page
 */

function refreshPage(second) {
    setTimeout(function () {
        location.reload();
    }, second)
}

function msgModal(option) {
    document.getElementById('msg-title').innerHTML = option.title;
    document.getElementById('msg-body').innerHTML = option.content;
    $('#msg').modal()
}

function outputError(data) {
    msgModal({
        title: 'Something wrong happened',
        content: '<code>' + data + '</code><br>The page will be refreshed in 5 second.'
    });
    refreshPage(5000);
}

/*
 * Fetch helper
 */

get = (url) =>
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': username + ' ' + apikey,
            'Content-Type': 'application/json'
        }
    }).then(resp => Promise.all([resp.ok, resp.status, resp.json()])
    ).then(([ok, status, json]) => {
        if (ok) {
            return json;
        } else {
            throw new Error(JSON.stringify(json.error));
        }
    }).catch(error => {
        throw error;
    });

post = (url, body) => this._request(url, body, 'POST');

put = (url, body) => this._request(url, body, 'PUT');

_delete = (url, body) => this._request(url, body, 'DELETE');

_request = (url, body, method) =>
    fetch(url, {
        method: method,
        body: body,
        headers: {
            'Authorization': username + ' ' + apikey,
            'content-type': 'application/json'
        }
    }).then(resp => {
        return Promise.all([resp.ok, resp.status, resp.json()]);
    }).then(([ok, status, json]) => {
        if (ok) {
            return json;
        } else {
            throw new Error(JSON.stringify(json.error));
        }
    }).catch(error => {
        throw error;
    });

/*
 * Check whether user has already login or not
 * If user has already login then redirect them to zone list page
 * If not then redirect them to login page
 */

window.onload = function () {
    if ((!apikey || !username || !apiendpoint) && (window.location.pathname !== "/")) {
        msgModal({
            title: 'Redirecting...',
            content: 'You haven\'t fill in your Token or Username! Redirecting to login page in about 5 seconds...'
        });
        setTimeout(function () {
            window.location.href = "/"
        }, 5000)
    };
    if (apikey && username && apiendpoint && (window.location.pathname === "/")) {
        msgModal({
            title: 'Redirecting...',
            content: 'You have already logged in! Redirecting to Zone List Page in about 5 seconds...'
        });
        setTimeout(function () {
            window.location.href = "/zone/"
        }, 5000)
    }
};

/*
 * loginSubmit()
 * Used at login page
 */

function loginSubmit() {
    var loginUsername = document.getElementById('login-username').value;
    var loginKey = document.getElementById('login-token').value;
    var apiEndpoint = document.getElementById('login-api').value;
    setLS('token', loginKey);
    setLS('username', loginUsername);
    setLS('api', apiEndpoint);
    msgModal({
        title: 'Logging in',
        content: 'You will be redirected to Zone List Page in about 5 seconds...'
    });
    setTimeout(function () {
        window.location.href = "/zone/"
    }, 5000)
}

/*
 * logout()
 * Used at every page except login page
 */

function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("secretkey");
    msgModal({
        title: 'Logging out',
        content: 'Cleaning browser localstorage. You will be logged out soon.'
    });
    setTimeout(function () {
        window.location.href = "/"
    }, 5000)
}

/*
 * getDomainList()
 * Used at domain list page
 */

function getDomainList() {
    msgModal({
        title: 'Loading domain list',
        content: 'Please sit and relax...'
    });

    get(apiendpoint + "/v2/domains").then(json => {
        $('#msg').modal('hide');
        var domainNum = 0;
        json.domains.forEach((value, index) => {
            document.getElementById('list-no-domain').classList.add("sk-hide");
            var html = baidu.template('domain-item-tpl', value);
            document.getElementById('domainListBody').insertAdjacentHTML('beforeend', html);
            domainNum = domainNum + 1;
            document.getElementById('list-domain-num').innerHTML = domainNum;
        });
    }).catch(error => {
        outputError(error);
    });

}

/*
 * newDomain()
 * Used at domain list page
 */

function newDomain() {
    $('#new-domain').modal('hide')
    var newdomain = document.getElementById('new-domain-name').value;
    msgModal({
        title: 'Adding' + '&nbsp;<span class=\"text-info\">' + newdomain + '</span>',
        content: 'Please sit and relax...'
    });
    var data = JSON.stringify({ name: newdomain, serviceType: "zeit.world" });
    post(apiendpoint + "/v2/domains", data)
        .then(json => {
            msgModal({
                title: '<span class=\"text-info\">' + newdomain + '</span> added successfully',
                content: 'The page will be refreshed in 5 second'
            });
            refreshPage(5000);
        })
        .catch(error => {
            outputError(error);
        });
}

/*
 * confirmDeleteDomain()
 * deleteDomain()
 * Used at domain list page
 */

function confirmDeleteDomain(el) {
    var domainWillBeleted = el.getAttribute("data-id");
    msgModal({
        title: '<span class="sk-text-bold text-danger">ATTENTION!! This action is irreversible!</span>',
        content: '<span class="sk-text-bold">Domain <span class="text-info">' + domainWillBeleted + '</span> will be deleted!</span><br>Are you sure you want to delele this domain? All records under this domain will be lost and can\'t be recovered!!' + '<br><button type="button" class="btn btn-danger sk-mt-4 sk-mr-2" onclick="deleteDomain(\'' + domainWillBeleted + '\')">Confirm</button><button type="button" class="btn btn-secondary sk-mt-4" data-dismiss="modal" aria-label="Close">Cancel</button>'
    });
}

function deleteDomain(domain) {
    msgModal({
        title: 'Deleting domain <span class="text-info">' + domain + '</span>',
        content: 'Please sit and relax...'
    });
    _delete(apiendpoint + '/v2/domains/' + domain, JSON.stringify({}))
        .then(json => {
            msgModal({
                title: '<span class=\"text-info\">' + domain + '</span> was successfully deleted!',
                content: 'The page will be refreshed in 5 second.'
            });
            refreshPage(5000);
        })
        .catch(error => {
            outputError(error);
        });
}

/*
 * getCurrentDomain()
 * Used at record list page
 * before any record related else
 */

function getCurrentDomain() {
    String.prototype.queryUrl = function (e) {
        var t = this.replace(/^[^?=]*\?/ig, "").split("#")[0],
            n = {};
        return t.replace(/(^|&)([^&=]+)=([^&]*)/g, function (e, t, r, i) {
            try {
                r = decodeURIComponent(r)
            } catch (s) { }
            try {
                i = decodeURIComponent(i)
            } catch (s) { }
            r in n ? n[r] instanceof Array ? n[r].push(i) : n[r] = [n[r], i] : n[r] = /\[\]$/.test(r) ? [i] : i
        }), e ? n[e] : n
    };
    window.searchQuery = location.search.queryUrl();
    document.getElementById('current-domain').innerHTML = searchQuery.domain;
}

/*
 * getRecordList()
 * Used at record list page
 */
function getRecordList() {
    msgModal({
        title: 'Loading records of <span class="text-info">' + searchQuery.domain + '</span>',
        content: 'Please sit and relax...'
    });
    var recordNum = 0

    get(apiendpoint + '/v2/domains/' + searchQuery.domain + '/records').then(json => {
        $('#msg').modal('hide');
        json.records.forEach((value, index) => {
            recordNum = recordNum + 1

            if (value.name.length === 0) {
                value.recordName = "@"
            } else {
                value.recordName = value.name
            }

            if (value.name.length === 0) {
                value.recordDomain = searchQuery.domain
            } else {
                value.recordDomain = value.name + "." + searchQuery.domain
            }

            if (value.mxPriority) {
                value.recordMxPriority = "<span class=\"sk-pr-2\">" + value.mxPriority + "</span>"
            } else {
                value.recordMxPriority = ""
            }

            var html = baidu.template('record-item-tpl', value);
            document.getElementById('recordListBody').insertAdjacentHTML('afterbegin', html);
        });
        showRecordInfo();
        document.getElementById('record-list-num').innerHTML = recordNum;
    }).catch(error => {
        outputError(error);
    });

}

/*
 * showRecordInfo()
 * Used only in getRecordList()
 */
function showRecordInfo() {
    var mainEl = document.getElementsByClassName('record-main');
    for (var i = 0; i < mainEl.length; i += 1) {
        mainEl[i].addEventListener('click', function () {
            this.classList.toggle("record-main-focus");
            var elID = this.getAttribute("data-id");
            document.getElementById('record-info-' + elID).classList.toggle("sk-hide");
        })
    }
}

/*
 * confirmDeleteRecord()
 * deleteRecord()
 * Used only in record list page
 */

function confirmDeleteRecord(el) {
    var recordWillDeleted = el.getAttribute("data-id");
    var recordDomainWillDeleted = el.getAttribute("data-name");
    var recordTypeWillDeleted = el.getAttribute("data-type");
    msgModal({
        title: '<span class="sk-text-bold text-danger">ATTENTION!! This action is irreversible!</span>',
        content: '<span class="sk-text-bold">Are you sure you want to delele the <span class="text-info">' + recordTypeWillDeleted + '</span> record?</span><br><span class="sk-text-bold text-primary">' + recordDomainWillDeleted + '</span>' + '<br><button type="button" class="btn btn-danger sk-mt-4 sk-mr-2" onclick="deleteRecord(\'' + recordWillDeleted + '\',\'' + recordTypeWillDeleted + '\')">Confirm</button><button type="button" class="btn btn-secondary sk-mt-4" data-dismiss="modal" aria-label="Close">Cancel</button>'
    });
}

function deleteRecord(id, type) {
    msgModal({
        title: 'Deleting <span class="text-info">' + type + '</span> record',
        content: 'Please ait and relax...'
    });

    _delete(apiendpoint + '/v2/domains/' + searchQuery.domain + '/records/' + id, JSON.stringify({}))
        .then(json => {
            msgModal({
                title: 'Successfully deleted!',
                content: 'The page will be refreshed in 5 second'
            });
            refreshPage(5000);
        })
        .catch(error => {
            outputError(error);
        });
}

/*
 * toggleMXPriority()
 * Used only at record list page
 */

function toggleMXPriority() {
    document.getElementById('new-record-mx-priority-group').style.display = 'none';
    document.getElementById('new-record-type').addEventListener('change', function() {
        if (document.getElementById('new-record-type').value === "MX") {
            document.getElementById('new-record-mx-priority-group').style.display = 'block';
        } else {
            document.getElementById('new-record-mx-priority-group').style.display = 'none';
        }
    });
}

/*
 * submitNewRecord()
 * Used only at record list page
 */

function submitNewRecord() {
    var newRecordName = document.getElementById('new-record-name').value;
    var newRecordType = document.getElementById('new-record-type').value;
    var newRecordMXPriority = document.getElementById('new-record-mx-priority').value;
    var newRecordValue = document.getElementById('new-record-value').value;
    $('#new-record').modal('hide')
    msgModal({
        title: 'Adding new <span class="text-info">' + newRecordType + '</span> record',
        content: 'Please ait and relax...'
    });

    if (newRecordName === "@") {
        newRecordName = "";
    }
    if (newRecordType === "MX") {
        var data = JSON.stringify({
            name: newRecordName,
            type: newRecordType,
            mxPriority: parseInt(newRecordMXPriority),
            value: newRecordValue
        });
    } else {
        var data = JSON.stringify({
            name: newRecordName,
            type: newRecordType,
            value: newRecordValue
        });
    }

    post(apiendpoint + "/v2/domains/" + searchQuery.domain + "/records", data)
        .then(json => {
            msgModal({
                title: 'New record successfully added!',
                content: 'The page will be refreshed in 5 second.'
            });
            refreshPage(5000);
        })
        .catch(error => {
            outputError(error);
        });
}

/*
 * setAttrDeleteBtn()
 * Used only at record list page
 */
/*     var domainWillBeleted = el.getAttribute("data-id"); */
function setAttrDeleteBtn() {
    document.getElementById('domain-del-btn').setAttribute('data-id', searchQuery.domain);
}
