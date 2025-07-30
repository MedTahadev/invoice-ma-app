@@ .. @@
     'paths' => ['api/*', 'sanctum/csrf-cookie'],

-    'allowed_methods' => ['*'],
+    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

-    'allowed_origins' => ['*'],
+    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],

     'allowed_origins_patterns' => [],

-    'allowed_headers' => ['*'],
+    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],

     'exposed_headers' => [],

     'max_age' => 0,

-    'supports_credentials' => false,
+    'supports_credentials' => true,