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
 * Check whether user has already login or not
 * If user has already login then redirect them to zone list page
 * If not then redirect them to login page
 */

$(document).ready(function () {
    if ((!apikey || !username) && (window.location.pathname !== "/")) {
        $('#msg-title').html('Redirecting...')
        $('#msg-body').html('You haven\'t fill in your Token or Username! Redirecting to login page in about 5 seconds...')
        $('#msg').modal()
        setTimeout(function () {
            window.location.href = "/"
        }, 4000)
    };
    if (apikey && username && (window.location.pathname === "/")) {
        $('#msg-title').html('Redirecting...')
        $('#msg-body').html('You have already logged in! Redirecting to Zone List Page in about 5 seconds...')
        $('#msg').modal()
        setTimeout(function () {
            window.location.href = "/zone/"
        }, 4000)
    }
});

/*
 * loginSubmit()
 * Used at login page
 */

function loginSubmit() {
    var loginUsername = document.getElementById('login-username').value;
    var loginKey = document.getElementById('login-token').value;
    setLS('token', loginKey);
    setLS('username', loginUsername);
    $('#msg-title').html('Logging in')
    $('#msg-body').html('You will be redirected to Zone List Page in about 2 seconds...')
    $('#msg').modal()
    setTimeout(function () {
        window.location.href = "/zone/"
    }, 2000)
}

/*
 * logout()
 * Used at every page except login page
 */

function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("secretkey");
    $('#msg-title').html('Logging out')
    $('#msg-body').html('Cleaning browser localstorage. You will be logged out soon.')
    $('#msg').modal()
    setTimeout(function () {
        window.location.href = "/"
    }, 2000)
}

/*
 * getDomainList()
 * Used at domain list page
 */

function getDomainList() {
    var domainNum = 0;
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        type: "GET",
        url: "https://api.zeit.co/v2/domains",
        dataType: "json",
        success: function (data) {
            $.each(data.domains, function (index, value) {
                $("#list-no-domain").addClass("sk-hide");
                $("#domainListBody").append(`
                <tr>
                    <td class="sk-text-bold"><a href="/record/?domain=${value.name}">${value.name}</a></td>
                    <td>${value.serviceType}</td>
                    <td>
                        <button data-id="${value.name}" id="${value.name}-del-btn" onclick="confirmDeleteDomain(this)" type="button" class="btn sk-bg-error sk-text-light">DELETE</button>
                    </td>
                    <td>${new Date(value.created).toLocaleDateString()}</td>
                </tr>
                `);
                domainNum = domainNum + 1;
                $("#list-domain-num").html(domainNum)
            });
        },
        error: function (data) {
            $('#msg-title').html('Something wrong happened')
            $('#msg-body').html('<code>' + data.responseText + '</code><br>The page will be refreshed in 3 second.')
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
    $('#msg-title').html('Adding' + '&nbsp;<span class=\"text-info\">' + newdomain + '</span>')
    $('#msg-body').html('Please sit and relax...')
    $('#msg').modal()
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        type: "POST",
        url: "https://api.zeit.co/v2/domains",
        dataType: "json",
        data: "{\"name\":\"" + newdomain + "\",\"serviceType\":\"zeit.world\"}",
        success: function (data) {
            $('#msg-title').html('<span class=\"text-info\">' + newdomain + '</span> added successfully')
            $('#msg-body').html('The page will be refreshed in 5 second')
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        },
        error: function (data) {
            $('#msg-title').html('Something wrong happened')
            $('#msg-body').html('<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second.')
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
    $('#msg-title').html('<span class="sk-text-bold text-danger">ATTENTION!!</span>')
    $('#msg-body').html('<span class="sk-text-bold">Domain <span class="text-info">' + domainWillBeleted + '</span> will be deleted!</span><br>Are you sure you want to delele this domain? All records belong to this domain will be deleted and can\'t be recovered!!' + '<br><button type="button" class="btn btn-danger sk-mt-4 sk-mr-2" onclick="deleteDomain(\'' + domainWillBeleted + '\')">Confirm</button><button type="button" class="btn btn-secondary sk-mt-4" data-dismiss="modal" aria-label="Close">Cancel</button>')
    $('#msg').modal()
}

function deleteDomain(domain) {
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        url: 'https://api.zeit.co/v2/domains/' + domain,
        type: 'DELETE',
        data: {},
        success: function (data) {
            $('#msg-title').html('<span class=\"text-info\">' + domain + '</span> was successfully deleted!')
            $('#msg-body').html('The page will be refreshed in 5 second')
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        },
        error: function (data) {
            $('#msg-title').html('Something wrong happened')
            $('#msg-body').html('<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second.')
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
    window.currentDomain = location.search.queryUrl();
    $("#current-domain").html(currentDomain.domain)
}

/*
 * getRecordList()
 * Used at record list page
 */
function getRecordList() {
    var recordNum = 0
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });

    $.ajax({
        url: 'https://api.zeit.co/v2/domains/' + currentDomain.domain + '/records',
        type: 'GET',
        data: {},
        success: function (data) {
            $.each(data.records, function (index, value) {
                recordNum = recordNum + 1

                if (value.name.length === 0) {
                    var recordName = "@"
                } else {
                    var recordName = value.name
                }

                if (value.name.length === 0) {
                    var recordDomain = currentDomain.domain
                } else {
                    var recordDomain = value.name + "." + currentDomain.domain
                }

                if (value.mxPriority) {
                    var recordMxPriority = "<span class=\"sk-pr-2\">" + value.mxPriority + "</span>"
                } else {
                    var recordMxPriority = ""
                }
                $("#domainListBody").prepend(`
                <tr class="record-main">
                    <td>${recordName}</td>
                    <td>60</td>
                    <td>IN</td>
                    <td>${value.type}</td>
                    <td>${recordMxPriority}${value.value}</td>
                    <td>
                        <button type="button" class="btn btn-link sk-p-0" data-id="${value.id}" data-type="${value.type}" data-name="${recordDomain}" id="${value.name}-delete" onclick="confirmDeleteRecord(this)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path fill="none" d="M0 0h24v24H0V0z" />
                                <path fill="#e85600" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                                <path fill="none" d="M0 0h24v24H0z" />
                            </svg>
                        </button>
                    </td>
                    <td>
                        <span class="record-no-select">${new Date(value.updated).toLocaleDateString()}</span>
                    </td>
                </tr>
                <tr class="record-info sk-hide">
                    <td colspan="7">
                        <dl>
                            <dt>Name</dt>
                            <dd>${recordDomain}</dd>
                            <dt>TTL</dt>
                            <dd>60 <span class="sk-text-dark">seconds</span></dd>
                            <dt>Type</dt>
                            <dd>${value.type}</dd>
                            <dt>Value</dt>
                            <dd class="break-all">${recordMxPriority}${value.value}</dd>
                            <dt>Created</dt>
                            <dd>${new Date(value.created).toLocaleDateString()}</dd>
                            <dt>Updated</dt>
                            <dd>${new Date(value.updated).toLocaleDateString()}</dd>
                            <dt>ID</dt>
                            <dd>${value.id}</dd>
                        </dl>
                    </td>
                </tr>
                `);
            });
            showRecordInfo();
            $("#record-list-num").html(recordNum)
        },
        error: function (data) {
            $('#msg-title').html('Something wrong happened')
            $('#msg-body').html('<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second')
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
    $('#msg-title').html('<span class="sk-text-bold text-danger">ATTENTION!!</span>')
    $('#msg-body').html('<span class="sk-text-bold">Are you sure you want to delele the <span class="text-info">' + recordTypeWillDeleted + '</span> record?</span><br><span class="sk-text-bold text-primary">' + recordDomainWillDeleted + '</span>' + '<br><button type="button" class="btn btn-danger sk-mt-4 sk-mr-2" onclick="deleteRecord(\'' + recordWillDeleted + '\')">Confirm</button><button type="button" class="btn btn-secondary sk-mt-4" data-dismiss="modal" aria-label="Close">Cancel</button>')
    $('#msg').modal()
}

function deleteRecord(id) {
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        url: 'https://zeit-dns-panel.netlify.com/api/domains/' + currentDomain.domain + '/records/' + id,
        type: 'DELETE',
        data: {},
        success: function (data) {
            $('#msg-title').html('Successfully deleted!')
            $('#msg-body').html('The page will be refreshed in 5 second')
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        },
        error: function (data) {
            $('#msg-title').html('Something wrong happened')
            $('#msg-body').html('<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second')
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        }
    });
}
