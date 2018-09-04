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
            $('#msg-body').html('<code>' + data.responseText + '</code><br>The page will be refreshed in 3 second')
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
    $('#msg-title').html('Adding' + '&nbsp;<span class=\"text-primary\">' + newdomain + '</span>')
    $('#msg-body').html('Please sit and relax')
    $('#msg').modal()
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        type: "POST",
        url: "https://api.zeit.co/v2/domains",
        dataType: "json",
        data: "{\"name\":\"" + newdomain + "\",\"serviceType\":\"zeit.world\"}",
        success: function (data) {
            $('#msg-title').html(newdomain + ' added successfully')
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
 * confirmDeleteDomain()
 * deleteDomain()
 * Used at domain list page
 */

function confirmDeleteDomain(el) {
    var domainWillBeleted = el.getAttribute("data-id");
    $('#msg-title').html('<span class="sk-text-bold text-danger">ATTENTION!!</span>')
    $('#msg-body').html('<span class="sk-text-bold">Domain <span class="text-info">' + domainWillBeleted + '</span> will be deleted!</span><br>Are you sure you want to delele this domain? All records belong to this domain will be deleted and can\'t be recovered!!' + '<br><button type="button" class="btn btn-danger sk-mt-4 sk-mr-2" onclick="deleteDomain(\''+ domainWillBeleted +'\')">Confirm</button><button type="button" class="btn btn-secondary sk-mt-4" data-dismiss="modal" aria-label="Close">Cancel</button>')
    $('#msg').modal()
}

function deleteDomain(domain) {
    console.log(domain)
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.ajax({
        url: 'https://zeit-dns-panel.netlify.com/api/domains/' + domain,
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
            $('#msg-body').html(data.responseText + '<br>The page will be refreshed in 5 second')
            $('#msg').modal()
            setTimeout(function () {
                location.reload();
            }, 5000)
        }
    });
}