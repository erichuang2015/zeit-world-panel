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

var msgTitleEl = document.getElementById('msg-title');
var msgBodyEl = document.getElementById('msg-body');

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
 * Fetch helper
 */

get = (url) =>
    fetch(url, {
        method: 'GET',
    }).then(resp => Promise.all([resp.ok, resp.status, resp.json()])
    ).then(([ok, status, json]) => {
        if (ok) {
            return json;
        } else {
            this.handleError(status, json.error);
            throw new Error(json.error);
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
        body: JSON.stringify(body)
    }).then(resp => {
        return Promise.all([resp.ok, resp.status, resp.json()]);
    }).then(([ok, status, json]) => {
        if (ok) {
            return json;
        } else {
            this.handleError(status, json.error);
            throw new Error(json.error);
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
        msgTitleEl.innerHTML = 'Redirecting...';
        msgBodyEl.innerHTML = 'You haven\'t fill in your Token or Username! Redirecting to login page in about 5 seconds...';
        $('#msg').modal()
        setTimeout(function () {
            window.location.href = "/"
        }, 4000)
    };
    if (apikey && username && apiendpoint && (window.location.pathname === "/")) {
        msgTitleEl.innerHTML = 'Redirecting...';
        msgBodyEl.innerHTML = 'You have already logged in! Redirecting to Zone List Page in about 5 seconds...';
        $('#msg').modal()
        setTimeout(function () {
            window.location.href = "/zone/"
        }, 4000)
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
    msgTitleEl.innerHTML = 'Logging in';
    msgBodyEl.innerHtml = 'You will be redirected to Zone List Page in about 5 seconds...';
    $('#msg').modal()
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
    msgTitleEl.innerHTML = 'Logging out';
    msgBodyEl.innerHTML = 'Cleaning browser localstorage. You will be logged out soon.';
    $('#msg').modal()
    setTimeout(function () {
        window.location.href = "/"
    }, 3000)
}

/*
 * getDomainList()
 * Used at domain list page
 */

function getDomainList() {
    msgTitleEl.innerHTML = 'Loading domain list';
    msgBodyEl.innerHTML = 'Please sit and relax...';
    $('#msg').modal()
    var domainNum = 0;
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        type: "GET",
        url: apiendpoint + "/v2/domains",
        dataType: "json",
        success: function (data) {
            $('#msg').modal('hide');
            data.domains.forEach((value, index) => {
                document.getElementById('list-no-domain').classList.add("sk-hide");
                var html = baidu.template('domain-item-tpl', value);
                document.getElementById('domainListBody').insertAdjacentHTML('beforeend', html);
                domainNum = domainNum + 1;
                document.getElementById('list-domain-num').innerHTML = domainNum;
            });
        },
        error: function (data) {
            msgTitleEl.innerHTML = 'Something wrong happened';
            msgBodyEl.innerHTML = '<code>' + data.responseText + '</code><br>The page will be refreshed in 3 second.';
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 3000)
        }
    });
}

/*
 * newDomain()
 * Used at domain list page
 */

function newDomain() {
    $('#new-domain').modal('hide')
    var newdomain = document.getElementById('new-domain-name').value;
    msgTitleEl.innerHTML = 'Adding' + '&nbsp;<span class=\"text-info\">' + newdomain + '</span>';
    msgBodyEl.innerHTML = 'Please sit and relax...';
    $('#msg').modal()
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        type: 'POST',
        url: apiendpoint + "/v2/domains",
        dataType: "json",
        data: JSON.stringify({
            name: newdomain,
            serviceType: "zeit.world"
        }),
        success: function (data) {
            msgTitleEl.innerHTML = '<span class=\"text-info\">' + newdomain + '</span> added successfully';
            msgBodyEl.innerHTML = 'The page will be refreshed in 5 second';
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        },
        error: function (data) {
            msgTitleEl.innerHTML = 'Something wrong happened';
            msgBodyEl.innerHTML = '<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second.';
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        }
    });
}

/*
 * confirmDeleteDomain()
 * deleteDomain()
 * Used at domain list page
 */

function confirmDeleteDomain(el) {
    var domainWillBeleted = el.getAttribute("data-id");
    msgTitleEl.innerHTML = '<span class="sk-text-bold text-danger">ATTENTION!! This action is irreversible!</span>';
    msgBodyEl.innerHTML = '<span class="sk-text-bold">Domain <span class="text-info">' + domainWillBeleted + '</span> will be deleted!</span><br>Are you sure you want to delele this domain? All records under this domain will be lost and can\'t be recovered!!' + '<br><button type="button" class="btn btn-danger sk-mt-4 sk-mr-2" onclick="deleteDomain(\'' + domainWillBeleted + '\')">Confirm</button><button type="button" class="btn btn-secondary sk-mt-4" data-dismiss="modal" aria-label="Close">Cancel</button>';
    $('#msg').modal()
}

function deleteDomain(domain) {
    msgTitleEl.innerHTML = 'Deleting domain <span class="text-info">' + domain + '</span>';
    msgBodyEl.innerHTML = 'Please sit and relax...';
    $('#msg').modal()
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        url: apiendpoint + '/v2/domains/' + domain,
        type: 'DELETE',
        data: {},
        success: function (data) {
            msgTitleEl.innerHTML = '<span class=\"text-info\">' + domain + '</span> was successfully deleted!';
            msgBodyEl.innerHTML = 'The page will be refreshed in 5 second';
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        },
        error: function (data) {
            msgTitleEl.innerHTML = 'Something wrong happened';
            msgBodyEl.innerHTML = '<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second.';
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        }
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
    msgTitleEl.innerHTML = 'Loading records of <span class="text-info">' + searchQuery.domain + '</span>';
    msgBodyEl.innerHTML = 'Please sit and relax...';
    $('#msg').modal()
    var recordNum = 0
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });

    $.ajax({
        url: apiendpoint + '/v2/domains/' + searchQuery.domain + '/records',
        type: 'GET',
        data: {},
        success: function (data) {
            $('#msg').modal('hide');
            data.records.forEach((value, index) => {
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
        },
        error: function (data) {
            msgTitleEl.innerHTML = 'Something wrong happened';
            msgBodyEl.innerHTML = '<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second';
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        }
    });
}

/*
 * showRecordInfo()
 * Used only in getRecordList()
 */
function showRecordInfo() {
    $('.record-main').click(function () {
        $(this).toggleClass("record-main-focus");
        $(this).nextUntil('tr.record-main').toggleClass("sk-hide");
    });
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
    msgTitleEl.innerHTML = '<span class="sk-text-bold text-danger">ATTENTION!! This action is irreversible!</span>';
    msgBodyEl.innerHTML = '<span class="sk-text-bold">Are you sure you want to delele the <span class="text-info">' + recordTypeWillDeleted + '</span> record?</span><br><span class="sk-text-bold text-primary">' + recordDomainWillDeleted + '</span>' + '<br><button type="button" class="btn btn-danger sk-mt-4 sk-mr-2" onclick="deleteRecord(\'' + recordWillDeleted + '\',\''+ recordTypeWillDeleted +'\')">Confirm</button><button type="button" class="btn btn-secondary sk-mt-4" data-dismiss="modal" aria-label="Close">Cancel</button>';
    $('#msg').modal()
}

function deleteRecord(id, type) {
    msgTitleEl.innerHTML = 'Deleting <span class="text-info">' + type + '</span> record';
    msgBodyEl.innerHTML = 'Please ait and relax...';
    $('#msg').modal()
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        url: apiendpoint + '/v2/domains/' + searchQuery.domain + '/records/' + id,
        type: 'DELETE',
        data: {},
        success: function (data) {
            msgTitleEl.innerHTML = 'Successfully deleted!';
            msgBodyEl.innerHTML = 'The page will be refreshed in 5 second';
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        },
        error: function (data) {
            msgTitleEl.innerHTML = 'Something wrong happened';
            msgBodyEl.innerHTML = '<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second';
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        }
    });
}

/*
 * toggleMXPriority()
 * Used only at record list page
 */

function toggleMXPriority() {
    document.getElementById('new-record-mx-priority-group').style.display = 'none';
    $('#new-record-type').on('change', function () {
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
    msgTitleEl.innerHTML = 'Adding new <span class="text-info">' + newRecordType + '</span> record';
    msgBodyEl.innerHTML = 'Please sit and relax...';
    $('#msg').modal()
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    if (newRecordName === "@") {
        newRecordName = "";
    }
    if (newRecordType === "MX") {
        $.ajax({
            type: 'POST',
            url: apiendpoint + "/v2/domains/" + searchQuery.domain + "/records",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
                name: newRecordName,
                type: newRecordType,
                mxPriority: parseInt(newRecordMXPriority),
                value: newRecordValue
            }),
            success: function (data) {
                msgTitleEl.innerHTML = 'New record successfully added!';
                msgBodyEl.innerHTML = 'The page will be refreshed in 5 second.';
                $('#msg').modal()
                setTimeout(function () {
                    location.reload();
                }, 5000)
            },
            error: function (data) {
                msgTitleEl.innerHTML = 'Something wrong happened';
                msgBodyEl.innerHTML = '<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second.';
                $('#msg').modal()
                debugger;
                setTimeout(function () {
                    location.reload();
                }, 5000)
            }
        });
    } else {
        $.ajax({
            type: 'POST',
            url: apiendpoint + '/v2/domains/' + searchQuery.domain + '/records',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                name: newRecordName,
                type: newRecordType,
                value: newRecordValue
            }),
            success: function (data) {
                msgTitleEl.innerHTML = 'New record successfully added!';
                msgBodyEl.innerHTML = 'The page will be refreshed in 5 second.';
                $('#msg').modal()
                setTimeout(function () {
                    location.reload();
                }, 5000)
            },
            error: function (data) {
                msgTitleEl.innerHTML = 'Something wrong happened';
                msgBodyEl.innerHTML = '<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second.';
                $('#msg').modal()
                setTimeout(function () {
                    location.reload();
                }, 5000)
            }
        });
    }
}

/*
 * setAttrDeleteBtn()
 * Used only at record list page
 */
/*     var domainWillBeleted = el.getAttribute("data-id"); */
function setAttrDeleteBtn() {
    document.getElementById('domain-del-btn').setAttribute('data-id', searchQuery.domain);
}
