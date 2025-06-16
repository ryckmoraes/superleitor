
package com.superleitor.app;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.superleitor.app.R;

public class MainActivity extends AppCompatActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Código simplificado para teste
        setContentView(R.layout.activity_main);
        
        // Criar TextView programaticamente para mostrar que o app carregou
        TextView textView = new TextView(this);
        textView.setText("App carregou!");
        textView.setTextSize(24);
        textView.setGravity(android.view.Gravity.CENTER);
        setContentView(textView);
        
        // Todo o código Capacitor comentado temporariamente
        // super.onCreate(savedInstanceState);
    }
}
