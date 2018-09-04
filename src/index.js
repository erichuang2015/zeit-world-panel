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
 * If user has already login then redirect them to domain list page
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
        $('#msg-body').html('You have already logged in! Redirecting to Domain List Page in about 5 seconds...')
        $('#msg').modal()
        setTimeout(function () {
            window.location.href = "/domain/"
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
    $('#msg-body').html('You will be redirected to Domain List Page in about 2 seconds...')
    $('#msg').modal()
    setTimeout(function () {
        window.location.href = "/domain/"
    }, 2000)
}

/*
 * logout()
 * Used at every page except login page
 */

function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("secretkey");
    mdui.alert('Cleaning browser localstorage. You will be logged out soon.');
    $('#msg-title').html('Logging out')
    $('#msg-body').html('Cleaning browser localstorage. You will be logged out soon.')
    $('#msg').modal()
    setTimeout(function () {
        window.location.href = "/domain/"
    }, 2000)
}

/*
 * getDomainList()
 * Used at domain list page
 */

function getDomainList() {
    $.ajaxSetup({ headers: { 'Authorization': username + ' ' + apikey } });
    $.getJSON("https://api.zeit.co/v2/domains", function (data) {
        $.each(data.domains, function (index, value) {
            $("#domainListBody").append(`
            <tr>
                <td class="sk-text-dark sk-text-bold">${value.name}</td>
                <td>${value.created}</td>
                <td>${value.serviceType}</td>
                <td>
                    <button data-id="${value.name}" id="${value.name}-record" class="btn btn-info" onclick="recordDomain(this)">Record</button>
                    <button data-id="${value.name}" id="${value.name}-delete" class="btn btn-danger" onclick="confirmDeleteDomain(this)">DELETE</button>
                </td>
            </tr>
        `);
        });
    });
}