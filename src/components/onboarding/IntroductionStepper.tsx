import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const IntroductionStepper = () => {
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [adminName, setAdminName] = useState(onboardingData.adminName || "");
  const [adminBirthdate, setAdminBirthdate] = useState<Date | null>(onboardingData.adminBirthdate || null);
  const [password, setPassword] = useState(onboardingData.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [superReaderName, setSuperReaderName] = useState(onboardingData.superReaderName || "");
  const [superReaderBirthdate, setSuperReaderBirthdate] = useState<Date | null>(onboardingData.superReaderBirthdate || null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateCurrentStep = () => {
    setFormErrors({});
    let isValid = true;
    
    if (currentStep === 0) {
      if (!adminName.trim()) {
        setFormErrors(prev => ({ ...prev, adminName: "Nome do administrador é obrigatório" }));
        isValid = false;
      }
    } 
    else if (currentStep === 1) {
      if (!adminBirthdate) {
        setFormErrors(prev => ({ ...prev, adminBirthdate: "Data de nascimento é obrigatória" }));
        isValid = false;
      } else {
        // Check if admin is at least 18 years old
        const today = new Date();
        const birthDate = new Date(adminBirthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 18) {
          setFormErrors(prev => ({ ...prev, adminBirthdate: "Você deve ter pelo menos 18 anos" }));
          isValid = false;
        }
      }
    }
    else if (currentStep === 2) {
      if (!password) {
        setFormErrors(prev => ({ ...prev, password: "Senha é obrigatória" }));
        isValid = false;
      } else if (password.length < 4) {
        setFormErrors(prev => ({ ...prev, password: "Senha deve ter pelo menos 4 caracteres" }));
        isValid = false;
      } else if (password !== confirmPassword) {
        setFormErrors(prev => ({ ...prev, confirmPassword: "As senhas não coincidem" }));
        isValid = false;
      }
    }
    else if (currentStep === 3) {
      if (!superReaderName.trim()) {
        setFormErrors(prev => ({ ...prev, superReaderName: "Nome do Super Leitor é obrigatório" }));
        isValid = false;
      }
    }
    else if (currentStep === 4) {
      if (!superReaderBirthdate) {
        setFormErrors(prev => ({ ...prev, superReaderBirthdate: "Data de nascimento é obrigatória" }));
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save all data
    updateOnboardingData({
      adminName,
      adminBirthdate,
      password,
      superReaderName,
      superReaderBirthdate,
      setupCompleted: true
    });
    
    // Also store the password in localStorage for the password protection
    localStorage.setItem("app_password", password);
    
    toast({
      title: "Configuração concluída",
      description: "Todas as configurações foram salvas com sucesso!",
    });
    
    // Navigate to recording screen
    navigate("/record");
  };

  // Function to check if a person is at least 18 years old
  const isAdult = (date: Date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">1</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-center">Informações do Administrador</h2>
            <p className="text-muted-foreground text-center">Insira seu nome para começar a configuração.</p>
            
            <div className="space-y-2 mt-6">
              <Label htmlFor="adminName">Nome do Administrador</Label>
              <Input
                id="adminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Digite seu nome completo"
                className={cn(
                  "bg-secondary/50 border-primary/20 focus:border-primary", 
                  formErrors.adminName ? "border-red-500" : ""
                )}
              />
              {formErrors.adminName && (
                <p className="text-sm text-red-500">{formErrors.adminName}</p>
              )}
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">2</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-center">Data de Nascimento</h2>
            <p className="text-muted-foreground text-center">Insira sua data de nascimento. Você deve ter pelo menos 18 anos para continuar.</p>
            
            <div className="space-y-2 mt-6">
              <Label htmlFor="adminBirthdate">Data de Nascimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="adminBirthdate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-secondary/50 border-primary/20",
                      !adminBirthdate && "text-muted-foreground",
                      formErrors.adminBirthdate ? "border-red-500" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {adminBirthdate ? format(adminBirthdate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={adminBirthdate || undefined}
                    onSelect={setAdminBirthdate}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className="bg-white shadow-lg rounded-md border"
                    styles={{
                      month: { backgroundColor: '#fff' },
                      caption_label: { color: '#000', fontWeight: 'bold' },
                      nav_button: { color: '#000' },
                      day: { 
                        color: '#000',
                        backgroundColor: '#fff',
                        borderRadius: '0.25rem',
                        margin: '0.1rem'
                      },
                      today: { 
                        backgroundColor: '#f0f9ff', 
                        color: '#0284c7',
                        fontWeight: 'bold'
                      },
                      selected: { 
                        backgroundColor: '#0284c7', 
                        color: '#fff' 
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {formErrors.adminBirthdate && (
                <p className="text-sm text-red-500">{formErrors.adminBirthdate}</p>
              )}
              
              {adminBirthdate && !isAdult(adminBirthdate) && (
                <p className="text-sm text-red-500">
                  Você deve ter pelo menos 18 anos para continuar.
                </p>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">3</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-center">Definição de Senha</h2>
            <p className="text-muted-foreground text-center">Crie uma senha para proteger o acesso ao menu e configurações.</p>
            
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className={cn(
                    "bg-secondary/50 border-primary/20 focus:border-primary",
                    formErrors.password ? "border-red-500" : ""
                  )}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme a Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className={cn(
                    "bg-secondary/50 border-primary/20 focus:border-primary",
                    formErrors.confirmPassword ? "border-red-500" : ""
                  )}
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">4</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-center">Informações do Super Leitor</h2>
            <p className="text-muted-foreground text-center">Insira o nome do Super Leitor.</p>
            
            <div className="space-y-2 mt-6">
              <Label htmlFor="superReaderName">Nome do Super Leitor</Label>
              <Input
                id="superReaderName"
                value={superReaderName}
                onChange={(e) => setSuperReaderName(e.target.value)}
                placeholder="Digite o nome do Super Leitor"
                className={cn(
                  "bg-secondary/50 border-primary/20 focus:border-primary",
                  formErrors.superReaderName ? "border-red-500" : ""
                )}
              />
              {formErrors.superReaderName && (
                <p className="text-sm text-red-500">{formErrors.superReaderName}</p>
              )}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">5</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-center">Data de Nascimento do {superReaderName}</h2>
            <p className="text-muted-foreground text-center">Insira a data de nascimento do {superReaderName}.</p>
            
            <div className="space-y-2 mt-6">
              <Label htmlFor="superReaderBirthdate">Data de Nascimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="superReaderBirthdate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-secondary/50 border-primary/20",
                      !superReaderBirthdate && "text-muted-foreground",
                      formErrors.superReaderBirthdate ? "border-red-500" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {superReaderBirthdate ? format(superReaderBirthdate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={superReaderBirthdate || undefined}
                    onSelect={setSuperReaderBirthdate}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className="bg-white shadow-lg rounded-md border pointer-events-auto"
                    styles={{
                      month: { backgroundColor: '#fff' },
                      caption_label: { color: '#000', fontWeight: 'bold' },
                      nav_button: { color: '#000' },
                      day: { 
                        color: '#000',
                        backgroundColor: '#fff',
                        borderRadius: '0.25rem',
                        margin: '0.1rem'
                      },
                      today: { 
                        backgroundColor: '#f0f9ff', 
                        color: '#0284c7',
                        fontWeight: 'bold'
                      },
                      selected: { 
                        backgroundColor: '#0284c7', 
                        color: '#fff' 
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {formErrors.superReaderBirthdate && (
                <p className="text-sm text-red-500">{formErrors.superReaderBirthdate}</p>
              )}
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto rounded-full bg-primary/20 p-3 w-20 h-20 flex items-center justify-center">
              <Check className="h-10 w-10 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight">Configuração Concluída!</h2>
            <p className="text-muted-foreground">
              Todas as configurações iniciais foram realizadas com sucesso.
              Clique em OK para começar a usar o aplicativo.
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="mb-8">
        <div className="w-full bg-muted h-3 rounded-full mb-2">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, ((currentStep + 1) / 6) * 100)}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Passo {currentStep + 1} de 6
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-md p-6 min-h-[350px] flex flex-col">
        <div className="flex-1">
          {renderStepContent()}
        </div>

        <Separator className="my-6" />

        <div className="flex justify-between">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={handleBack} className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < 5 ? (
            <Button onClick={handleNext} className="rounded-xl bg-primary hover:bg-primary/90">
              Avançar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="rounded-xl bg-primary hover:bg-primary/90">
              OK
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroductionStepper;
