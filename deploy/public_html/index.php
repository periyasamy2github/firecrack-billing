<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// UAT Laravel lives at ~/domains/ayyanagenciesdpm.com/uat_api (two levels up from uat_app).

if (file_exists($maintenance = __DIR__.'/../../uat_api/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../../uat_api/vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../../uat_api/bootstrap/app.php';

$app->handleRequest(Request::capture());