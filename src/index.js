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
 * Check whether user has already login or not
 * If user has already login then redirect them to zone list page
 * If not then redirect them to login page
 */

$(document).ready(function () {
    if ((!apikey || !username || !apiendpoint) && (window.location.pathname !== "/")) {
        $('#msg-title').html('Redirecting...')
        $('#msg-body').html('You haven\'t fill in your Token or Username! Redirecting to login page in about 5 seconds...')
        $('#msg').modal()
        setTimeout(function () {
            window.location.href = "/"
        }, 4000)
    };
    if (apikey && username && apiendpoint && (window.location.pathname === "/")) {
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
    var apiEndpoint = document.getElementById('login-api').value;
    setLS('token', loginKey);
    setLS('username', loginUsername);
    setLS('api', apiEndpoint);
    $('#msg-title').html('Logging in')
    $('#msg-body').html('You will be redirected to Zone List Page in about 5 seconds...')
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
    $('#msg-title').html('Logging out')
    $('#msg-body').html('Cleaning browser localstorage. You will be logged out soon.')
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
    $('#msg-title').html('Loading domain list')
    $('#msg-body').html('Please sit and relax...')
    $('#msg').modal()
    var domainNum = 0;
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        type: "GET",
        url: apiendpoint + "/v2/domains",
        dataType: "json",
        success: function (data) {
            $('#msg').modal('hide');
            $.each(data.domains, function (index, value) {
                $("#list-no-domain").addClass("sk-hide");
                var html = baidu.template('domain-item-tpl', value);
                $("#domainListBody").append(html);
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
        type: 'POST',
        url: apiendpoint + "/v2/domains",
        dataType: "json",
        data: JSON.stringify({
            name: newdomain,
            serviceType: "zeit.world"
        }),
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
    $('#msg-title').html('<span class="sk-text-bold text-danger">ATTENTION!! This action is irreversible!</span>')
    $('#msg-body').html('<span class="sk-text-bold">Domain <span class="text-info">' + domainWillBeleted + '</span> will be deleted!</span><br>Are you sure you want to delele this domain? All records under this domain will be lost and can\'t be recovered!!' + '<br><button type="button" class="btn btn-danger sk-mt-4 sk-mr-2" onclick="deleteDomain(\'' + domainWillBeleted + '\')">Confirm</button><button type="button" class="btn btn-secondary sk-mt-4" data-dismiss="modal" aria-label="Close">Cancel</button>')
    $('#msg').modal()
}

function deleteDomain(domain) {
    $('#msg-title').html('Deleting domain <span class="text-info">' + domain + '</span>')
    $('#msg-body').html('Please sit and relax...')
    $('#msg').modal()
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        url: apiendpoint + '/v2/domains/' + domain,
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
    window.searchQuery = location.search.queryUrl();
    $("#current-domain").html(searchQuery.domain)
}

/*
 * getRecordList()
 * Used at record list page
 */
function getRecordList() {
    $('#msg-title').html('Loading records of <span class="text-info">' + searchQuery.domain + '</span>')
    $('#msg-body').html('Please sit and relax...')
    $('#msg').modal()
    var recordNum = 0
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });

    $.ajax({
        url: apiendpoint + '/v2/domains/' + searchQuery.domain + '/records',
        type: 'GET',
        data: {},
        success: function (data) {
            $('#msg').modal('hide');
            $.each(data.records, function (index, value) {
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
                $("#recordListBody").prepend(html);
            });
            showRecordInfo();
            $("#record-list-num").html(recordNum);
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
    $('#msg-title').html('<span class="sk-text-bold text-danger">ATTENTION!! This action is irreversible!</span>')
    $('#msg-body').html('<span class="sk-text-bold">Are you sure you want to delele the <span class="text-info">' + recordTypeWillDeleted + '</span> record?</span><br><span class="sk-text-bold text-primary">' + recordDomainWillDeleted + '</span>' + '<br><button type="button" class="btn btn-danger sk-mt-4 sk-mr-2" onclick="deleteRecord(\'' + recordWillDeleted + '\',\''+ recordTypeWillDeleted +'\')">Confirm</button><button type="button" class="btn btn-secondary sk-mt-4" data-dismiss="modal" aria-label="Close">Cancel</button>')
    $('#msg').modal()
}

function deleteRecord(id, type) {
    $('#msg-title').html('Deleting <span class="text-info">' + type + '</span> record')
    $('#msg-body').html('Please ait and relax...')
    $('#msg').modal()
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        url: apiendpoint + '/v2/domains/' + searchQuery.domain + '/records/' + id,
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

/*
 * toggleMXPriority()
 * Used only at record list page
 */

function toggleMXPriority() {
    $('#new-record-mx-priority-group').css({ display: "none" });
    $('#new-record-type').on('change', function () {
        if ($('#new-record-type').val() === "MX") {
            $('#new-record-mx-priority-group').css({ display: "block" });
        } else {
            $('#new-record-mx-priority-group').css({ display: "none" });
        }
    });
}

/*
 * submitNewRecord()
 * Used only at record list page
 */

function submitNewRecord() {
    var newRecordName = $('#new-record-name').val();
    var newRecordType = $('#new-record-type').val();
    var newRecordMXPriority = $('#new-record-mx-priority').val();
    var newRecordValue = $('#new-record-value').val();
    $('#new-record').modal('hide')
    $('#msg-title').html('Adding new <span class="text-info">' + newRecordType + '</span> record')
    $('#msg-body').html('Please sit and relax...')
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
                $('#msg-title').html('New record successfully added!')
                $('#msg-body').html('The page will be refreshed in 5 second.')
                $('#msg').modal()
                setTimeout(function () {
                    location.reload();
                }, 5000)
            },
            error: function (data) {
                $('#msg-title').html('Something wrong happened')
                $('#msg-body').html('<code>' + data.responseText + '</code><br>The page will be refreshed in 5 second.')
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
                $('#msg-title').html('New record successfully added!')
                $('#msg-body').html('The page will be refreshed in 5 second.')
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
}

/*
 * setAttrDeleteBtn()
 * Used only at record list page
 */
/*     var domainWillBeleted = el.getAttribute("data-id"); */
function setAttrDeleteBtn() {
    document.getElementById('record-del-btn').setAttribute('data-id', searchQuery.domain);
}
