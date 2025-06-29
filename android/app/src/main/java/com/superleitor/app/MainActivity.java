
package com.superleitor.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.util.Log;

public class MainActivity extends Activity {
    
    private static final String TAG = "SuperleitorApp";
    private WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "=== INICIANDO MAINACTIVITY ===");
        
        // Criar WebView
        webView = new WebView(this);
        setContentView(webView);
        
        // Configurações do WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        
        Log.d(TAG, "WebView configurado");
        
        // Cliente Web simples
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                Log.d(TAG, "Página iniciando: " + url);
                super.onPageStarted(view, url, favicon);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d(TAG, "Página carregada: " + url);
                super.onPageFinished(view, url);
            }
            
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "Erro no WebView: " + description + " (" + errorCode + ")");
                super.onReceivedError(view, errorCode, description, failingUrl);
            }
        });
        
        // Carregar aplicação
        String url = "file:///android_asset/index.html";
        Log.d(TAG, "Carregando URL: " + url);
        webView.loadUrl(url);
        
        Log.d(TAG, "=== MAINACTIVITY INICIADA ===");
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
