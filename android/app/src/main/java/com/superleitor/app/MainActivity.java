
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
        
        Log.d(TAG, "MainActivity onCreate - INICIANDO");
        
        // Criar WebView
        webView = new WebView(this);
        setContentView(webView);
        
        // Configurações básicas do WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        Log.d(TAG, "WebView configurado - carregando assets");
        
        // WebViewClient simples
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d(TAG, "Página carregada: " + url);
                super.onPageFinished(view, url);
            }
        });
        
        // Carregar a aplicação
        webView.loadUrl("file:///android_asset/index.html");
        
        Log.d(TAG, "MainActivity onCreate - CONCLUÍDO");
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
