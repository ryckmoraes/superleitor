
package com.superleitor.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebResourceRequest;
import android.util.Log;

public class MainActivity extends Activity {
    
    private static final String TAG = "SuperleitorApp";
    private WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "=== MainActivity onCreate INICIADO ===");
        
        // Criar WebView
        webView = new WebView(this);
        setContentView(webView);
        
        // Configurar WebView de forma básica
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        Log.d(TAG, "WebView configurado");
        
        // Configurar WebViewClient básico
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Log.d(TAG, "Carregando URL: " + request.getUrl().toString());
                return false;
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d(TAG, "=== PÁGINA CARREGADA COM SUCESSO: " + url + " ===");
                super.onPageFinished(view, url);
            }
            
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "=== ERRO WEBVIEW: " + description + " em " + failingUrl + " ===");
                super.onReceivedError(view, errorCode, description, failingUrl);
            }
        });
        
        // Carregar aplicação
        String url = "file:///android_asset/index.html";
        Log.d(TAG, "=== CARREGANDO URL: " + url + " ===");
        webView.loadUrl(url);
        
        Log.d(TAG, "=== MainActivity onCreate CONCLUÍDO ===");
    }
    
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
