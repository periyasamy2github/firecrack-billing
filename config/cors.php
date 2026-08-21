<?php

return [
    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_map(
        'trim',
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:5174')),
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Bearer tokens, not cookies — no credentialed requests.
    'supports_credentials' => false,
];
