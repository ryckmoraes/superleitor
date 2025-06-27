
package com.superleitor.app;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "SuperleitorMainActivity";
    private WebView webView;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "=== INICIANDO MAINACTIVITY ===");
        
        try {
            Log.d(TAG, "Chamando super.onCreate...");
            super.onCreate(savedInstanceState);
            Log.d(TAG, "super.onCreate executado com sucesso");
            
            // Create and configure WebView
            webView = new WebView(this);
            setContentView(webView);
            
            // Configure WebView settings
            WebSettings webSettings = webView.getSettings();
            webSettings.setJavaScriptEnabled(true);
            webSettings.setDomStorageEnabled(true);
            webSettings.setAllowFileAccess(true);
            webSettings.setAllowContentAccess(true);
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            // Set WebView client
            webView.setWebViewClient(new WebViewClient());
            
            // Load the app - using the dist folder
            webView.loadUrl("file:///android_asset/public/index.html");
            
            // Enable debugging
            Log.d(TAG, "Habilitando WebView debugging...");
            WebView.setWebContentsDebuggingEnabled(true);
            Log.d(TAG, "WebView debugging habilitado");
            
            Log.d(TAG, "=== MAINACTIVITY INICIALIZADA COM SUCESSO ===");
            
        } catch (Exception e) {
            Log.e(TAG, "=== ERRO FATAL NA MAINACTIVITY ===", e);
            Log.e(TAG, "Erro: " + e.getMessage());
            Log.e(TAG, "Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Desconhecida"));
            
            // Re-lançar exceção para que apareça no logcat
            throw new RuntimeException("Falha na inicialização da MainActivity", e);
        }
    }
    
    @Override
    protected void onStart() {
        Log.d(TAG, "onStart() chamado");
        try {
            super.onStart();
            Log.d(TAG, "onStart() executado com sucesso");
        } catch (Exception e) {
            Log.e(TAG, "Erro em onStart()", e);
        }
    }
    
    @Override
    protected void onResume() {
        Log.d(TAG, "onResume() chamado");
        try {
            super.onResume();
            Log.d(TAG, "onResume() executado com sucesso");
        } catch (Exception e) {
            Log.e(TAG, "Erro em onResume()", e);
        }
    }
    
    @Override
    protected void onPause() {
        Log.d(TAG, "onPause() chamado");
        try {
            super.onPause();
            Log.d(TAG, "onPause() executado com sucesso");
        } catch (Exception e) {
            Log.e(TAG, "Erro em onPause()", e);
        }
    }
    
    @Override
    protected void onDestroy() {
        Log.d(TAG, "onDestroy() chamado");
        try {
            if (webView != null) {
                webView.destroy();
            }
            super.onDestroy();
            Log.d(TAG, "onDestroy() executado com sucesso");
        } catch (Exception e) {
            Log.e(TAG, "Erro em onDestroy()", e);
        }
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
