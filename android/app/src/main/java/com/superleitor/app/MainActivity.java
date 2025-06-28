
package com.superleitor.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SuperleitorMainActivity";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "=== INICIANDO MAINACTIVITY ===");
        
        try {
            super.onCreate(savedInstanceState);
            Log.d(TAG, "=== MAINACTIVITY INICIALIZADA COM SUCESSO ===");
        } catch (Exception e) {
            Log.e(TAG, "=== ERRO FATAL NA MAINACTIVITY ===", e);
            throw new RuntimeException("Falha na inicialização da MainActivity", e);
        }
    }
}
