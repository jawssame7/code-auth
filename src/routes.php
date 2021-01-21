<?php

use Slim\App;
use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Http\Uri;
use Slim\Http\RequestBody;
use Slim\Http\Headers;



return function (App $app) {
    $container = $app->getContainer();

    $googleClientSecret = 'Tw1x3B-nm3NB0X8kKGz-qRJq';
    $office365clientSecret =  '/33=fpc68Fatp[hqFtKNHNm_h6o3OvnH';
    $provider = null;

    $app->get('/', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' route");

        // Render index view
        return $container->get('renderer')->render($response, 'index.phtml', $args);
    });

    $app->get('/callback', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' route");

        // Render index view
        return $container->get('renderer')->render($response, 'callback.phtml', $args);
    });

    // トークン取得
    $app->any('/auth/{id}', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' route");

        $id = $args['id'];
        $params = $request->getQueryParams();
        $sendReq = null;
        $uri = null;


        if ($id === 'google') {
            $params['client_secret'] = 'Tw1x3B-nm3NB0X8kKGz-qRJq';
            // google
            $baseUrl = 'https://www.googleapis.com/oauth2/v4/token';
            $headers = [
                'Content-Type: application/x-www-form-urlencoded'
            ];
            $options = [
                'http' => [
                    'method' => 'POST',
                    'content' => http_build_query($params),
                    'header' => implode("\r\n", $headers)
                ]
            ];
            $res = json_decode(file_get_contents($baseUrl, false, stream_context_create($options)));
        } else {
            // office

            $provider = new TheNetworg\OAuth2\Client\Provider\Azure([
                'clientId'          => $params['client_id'],
                //'clientSecret'      => '/33=fpc68Fatp[hqFtKNHNm_h6o3OvnH',
                'redirectUri'       => $params['redirect_uri']
            ]);

            $res = $provider->getAccessToken('authorization_code', [
                'code' => $params['code'],
                //'resource' => 'https://graph.windows.net',
                'code_verifier' => $params['code_verifier']
            ]);

        }

        // Render index view
        $response = $response->withJson($res, 200);
        return $response;
        //return $container->get('renderer')->render($response, 'index.phtml', $args);
    });

    // アクセストークン リフレッシュ google
    $app->get('/refresh_token_google', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' route");

        $params = $request->getQueryParams();
        $params['client_secret'] = 'Tw1x3B-nm3NB0X8kKGz-qRJq';

        // google
        $baseUrl = 'https://www.googleapis.com/oauth2/v4/token';
        $headers = [
            'Content-Type: application/x-www-form-urlencoded'
        ];
        $options = [
            'http' => [
                'method' => 'POST',
                'content' => http_build_query($params),
                'header' => implode("\r\n", $headers)
            ]
        ];
        $res = json_decode(file_get_contents($baseUrl, false, stream_context_create($options)));

        // Render index view
        $response = $response->withJson($res, 200);
        return $response;
    });

    // アクセストークン リフレッシュ office365
    $app->get('/refresh_token_office365', function (Request $request, Response $response, array $args) use ($container) {
        // Sample log message
        $container->get('logger')->info("Slim-Skeleton '/' route");

        $params = $request->getQueryParams();
        $params['client_secret'] = '/33=fpc68Fatp[hqFtKNHNm_h6o3OvnH';


        $provider = new TheNetworg\OAuth2\Client\Provider\Azure([
            'clientId'          => $params['client_id'],
            //'clientSecret'      => '/33=fpc68Fatp[hqFtKNHNm_h6o3OvnH',
            'redirectUri'       => $params['redirect_uri']
        ]);

        //
        $res = $provider->getAccessToken('refresh_token', [
            'refresh_token' => $params['refresh_token']
        ]);

        // Render index view
        $response = $response->withJson($res, 200);
        return $response;
    });

};
