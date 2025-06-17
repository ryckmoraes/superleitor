
package com.superleitor.app;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SuperleitorMainActivity";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "=== INICIANDO MAINACTIVITY ===");
        
        try {
            Log.d(TAG, "Chamando super.onCreate...");
            super.onCreate(savedInstanceState);
            Log.d(TAG, "super.onCreate executado com sucesso");
            
            // Habilitar debugging do WebView
            Log.d(TAG, "Habilitando WebView debugging...");
            WebView.setWebContentsDebuggingEnabled(true);
            Log.d(TAG, "WebView debugging habilitado");
            
            // Registrar plugins adicionais se necessário
            Log.d(TAG, "Registrando plugins...");
            this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
                // Adicionar plugins customizados aqui se necessário
            }});
            Log.d(TAG, "Plugins registrados com sucesso");
            
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
            super.onDestroy();
            Log.d(TAG, "onDestroy() executado com sucesso");
        } catch (Exception e) {
            Log.e(TAG, "Erro em onDestroy()", e);
        }
    }
}
