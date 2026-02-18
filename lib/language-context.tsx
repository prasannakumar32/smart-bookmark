'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSettings } from './settings-context';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.bookmarks': 'Bookmarks',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signInWithGoogle': 'Sign in with Google',
    'auth.welcome': 'Welcome back',
    'auth.signingIn': 'Signing in...',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account settings and preferences',
    'settings.profile': 'Profile',
    'settings.appearance': 'Appearance',
    'settings.preferences': 'Preferences',
    'settings.dangerZone': 'Danger Zone',
    
    'settings.theme': 'Theme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.system': 'System',
    
    'settings.notifications': 'Email Notifications',
    'settings.notificationsDesc': 'Receive email updates about your bookmarks',
    'settings.autoSave': 'Auto-save',
    'settings.autoSaveDesc': 'Automatically save your changes',
    'settings.language': 'Language',
    
    'settings.signOut': 'Sign Out',
    'settings.signOutDesc': 'Sign out of your account on this device',
    'settings.signingOut': 'Signing out...',
    
    // Profile
    'profile.title': 'Profile',
    'profile.subtitle': 'Manage your professional profile and public information',
    'profile.basicInfo': 'Basic Information',
    'profile.socialLinks': 'Social Links',
    'profile.accountInfo': 'Account Information',
    
    'profile.displayName': 'Display Name',
    'profile.location': 'Location',
    'profile.bio': 'Bio',
    'profile.website': 'Website',
    'profile.github': 'GitHub',
    'profile.linkedin': 'LinkedIn',
    'profile.twitter': 'Twitter',
    
    'profile.email': 'Email',
    'profile.memberSince': 'Member Since',
    'profile.lastSignIn': 'Last Sign In',
    'profile.accountId': 'Account ID',
    
    'profile.editProfile': 'Edit Profile',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.saving': 'Saving...',
    
    // Bookmarks
    'bookmarks.title': 'Bookmarks',
    'bookmarks.subtitle': 'Manage your saved bookmarks',
    'bookmarks.addNew': 'Add New Bookmark',
    'bookmarks.titlePlaceholder': 'e.g., GitHub, YouTube, etc.',
    'bookmarks.urlPlaceholder': 'https://example.com',
    'bookmarks.addBookmark': 'Add Bookmark',
    'bookmarks.adding': 'Adding...',
    'bookmarks.noBookmarks': 'No bookmarks yet',
    'bookmarks.noBookmarksDesc': 'Start adding your favorite websites to keep them organized',
    'bookmarks.delete': 'Delete',
    'bookmarks.deleteConfirm': 'Are you sure you want to delete this bookmark?',
    'bookmarks.deleting': 'Deleting...',
    'bookmarks.visit': 'Visit',
    'bookmarks.copyLink': 'Copy Link',
    'bookmarks.copied': 'Copied!',
    'bookmarks.failedToLoad': 'Failed to load bookmarks',
    'bookmarks.failedToAdd': 'Failed to add bookmark',
    'bookmarks.failedToDelete': 'Failed to delete bookmark',
    'bookmarks.urlRequired': 'URL is required',
    'bookmarks.titleRequired': 'Title is required',
    'bookmarks.invalidUrl': 'Please enter a valid URL',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.notSet': 'Not set',
    'common.noBioProvided': 'No bio provided',
    'common.tellUsAboutYourself': 'Tell us about yourself...',
    'common.cityCountry': 'City, Country',
    'common.yourwebsite': 'https://yourwebsite.com',
    'common.username': 'username',
    'common.usernameHandle': '@username',
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.bookmarks': 'Marcadores',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'nav.signOut': 'Cerrar sesión',
    
    // Auth
    'auth.signIn': 'Iniciar sesión',
    'auth.signInWithGoogle': 'Iniciar sesión con Google',
    'auth.welcome': 'Bienvenido de nuevo',
    'auth.signingIn': 'Iniciando sesión...',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.subtitle': 'Gestiona la configuración de tu cuenta y preferencias',
    'settings.profile': 'Perfil',
    'settings.appearance': 'Apariencia',
    'settings.preferences': 'Preferencias',
    'settings.dangerZone': 'Zona de peligro',
    
    'settings.theme': 'Tema',
    'settings.light': 'Claro',
    'settings.dark': 'Oscuro',
    'settings.system': 'Sistema',
    
    'settings.notifications': 'Notificaciones por correo',
    'settings.notificationsDesc': 'Recibe actualizaciones por correo sobre tus marcadores',
    'settings.autoSave': 'Guardado automático',
    'settings.autoSaveDesc': 'Guarda automáticamente tus cambios',
    'settings.language': 'Idioma',
    
    'settings.signOut': 'Cerrar sesión',
    'settings.signOutDesc': 'Cierra sesión en este dispositivo',
    'settings.signingOut': 'Cerrando sesión...',
    
    // Profile
    'profile.title': 'Perfil',
    'profile.subtitle': 'Gestiona tu perfil profesional e información pública',
    'profile.basicInfo': 'Información básica',
    'profile.socialLinks': 'Enlaces sociales',
    'profile.accountInfo': 'Información de la cuenta',
    
    'profile.displayName': 'Nombre para mostrar',
    'profile.location': 'Ubicación',
    'profile.bio': 'Biografía',
    'profile.website': 'Sitio web',
    'profile.github': 'GitHub',
    'profile.linkedin': 'LinkedIn',
    'profile.twitter': 'Twitter',
    
    'profile.email': 'Correo electrónico',
    'profile.memberSince': 'Miembro desde',
    'profile.lastSignIn': 'Último inicio de sesión',
    'profile.accountId': 'ID de cuenta',
    
    'profile.editProfile': 'Editar perfil',
    'profile.save': 'Guardar',
    'profile.cancel': 'Cancelar',
    'profile.saving': 'Guardando...',
    
    // Bookmarks
    'bookmarks.title': 'Marcadores',
    'bookmarks.subtitle': 'Gestiona tus marcadores guardados',
    'bookmarks.addNew': 'Agregar Nuevo Marcador',
    'bookmarks.titlePlaceholder': 'ej., GitHub, YouTube, etc.',
    'bookmarks.urlPlaceholder': 'https://ejemplo.com',
    'bookmarks.addBookmark': 'Agregar Marcador',
    'bookmarks.adding': 'Agregando...',
    'bookmarks.noBookmarks': 'No hay marcadores aún',
    'bookmarks.noBookmarksDesc': 'Comienza a agregar tus sitios web favoritos para mantenerlos organizados',
    'bookmarks.delete': 'Eliminar',
    'bookmarks.deleteConfirm': '¿Estás seguro de que quieres eliminar este marcador?',
    'bookmarks.deleting': 'Eliminando...',
    'bookmarks.visit': 'Visitar',
    'bookmarks.copyLink': 'Copiar Enlace',
    'bookmarks.copied': '¡Copiado!',
    'bookmarks.failedToLoad': 'Error al cargar marcadores',
    'bookmarks.failedToAdd': 'Error al agregar marcador',
    'bookmarks.failedToDelete': 'Error al eliminar marcador',
    'bookmarks.urlRequired': 'La URL es requerida',
    'bookmarks.titleRequired': 'El título es requerido',
    'bookmarks.invalidUrl': 'Por favor ingresa una URL válida',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',
    'common.notSet': 'No establecido',
    'common.noBioProvided': 'No se proporcionó biografía',
    'common.tellUsAboutYourself': 'Cuéntanos sobre ti...',
    'common.cityCountry': 'Ciudad, País',
    'common.yourwebsite': 'https://tusitio.com',
    'common.username': 'nombredeusuario',
    'common.usernameHandle': '@nombredeusuario',
  },
  
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.bookmarks': 'Signets',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.signOut': 'Se déconnecter',
    
    // Auth
    'auth.signIn': 'Se connecter',
    'auth.signInWithGoogle': 'Se connecter avec Google',
    'auth.welcome': 'Bon retour',
    'auth.signingIn': 'Connexion en cours...',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Gérez les paramètres de votre compte et vos préférences',
    'settings.profile': 'Profil',
    'settings.appearance': 'Apparence',
    'settings.preferences': 'Préférences',
    'settings.dangerZone': 'Zone de danger',
    
    'settings.theme': 'Thème',
    'settings.light': 'Clair',
    'settings.dark': 'Sombre',
    'settings.system': 'Système',
    
    'settings.notifications': 'Notifications par email',
    'settings.notificationsDesc': 'Recevez des mises à jour par email sur vos signets',
    'settings.autoSave': 'Sauvegarde automatique',
    'settings.autoSaveDesc': 'Sauvegardez automatiquement vos modifications',
    'settings.language': 'Langue',
    
    'settings.signOut': 'Se déconnecter',
    'settings.signOutDesc': 'Se déconnecter sur cet appareil',
    'settings.signingOut': 'Déconnexion en cours...',
    
    // Profile
    'profile.title': 'Profil',
    'profile.subtitle': 'Gérez votre profil professionnel et vos informations publiques',
    'profile.basicInfo': 'Informations de base',
    'profile.socialLinks': 'Liens sociaux',
    'profile.accountInfo': 'Informations du compte',
    
    'profile.displayName': "Nom d'affichage",
    'profile.location': 'Localisation',
    'profile.bio': 'Biographie',
    'profile.website': 'Site web',
    'profile.github': 'GitHub',
    'profile.linkedin': 'LinkedIn',
    'profile.twitter': 'Twitter',
    
    'profile.email': 'Email',
    'profile.memberSince': 'Membre depuis',
    'profile.lastSignIn': 'Dernière connexion',
    'profile.accountId': 'ID de compte',
    
    'profile.editProfile': 'Modifier le profil',
    'profile.save': 'Enregistrer',
    'profile.cancel': 'Annuler',
    'profile.saving': 'Enregistrement...',
    
    // Bookmarks
    'bookmarks.title': 'Signets',
    'bookmarks.subtitle': 'Gérez vos signets enregistrés',
    'bookmarks.addNew': 'Ajouter un Nouveau Signet',
    'bookmarks.titlePlaceholder': 'ex., GitHub, YouTube, etc.',
    'bookmarks.urlPlaceholder': 'https://exemple.com',
    'bookmarks.addBookmark': 'Ajouter un Signet',
    'bookmarks.adding': 'Ajout...',
    'bookmarks.noBookmarks': 'Pas encore de signets',
    'bookmarks.noBookmarksDesc': 'Commencez à ajouter vos sites web favoris pour les garder organisés',
    'bookmarks.delete': 'Supprimer',
    'bookmarks.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer ce signet?',
    'bookmarks.deleting': 'Suppression...',
    'bookmarks.visit': 'Visiter',
    'bookmarks.copyLink': 'Copier le Lien',
    'bookmarks.copied': 'Copié!',
    'bookmarks.failedToLoad': 'Erreur lors du chargement des signets',
    'bookmarks.failedToAdd': 'Erreur lors de l\'ajout du signet',
    'bookmarks.failedToDelete': 'Erreur lors de la suppression du signet',
    'bookmarks.urlRequired': 'L\'URL est requise',
    'bookmarks.titleRequired': 'Le titre est requis',
    'bookmarks.invalidUrl': 'Veuillez entrer une URL valide',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.notSet': 'Non défini',
    'common.noBioProvided': 'Aucune biographie fournie',
    'common.tellUsAboutYourself': 'Parlez-nous de vous...',
    'common.cityCountry': 'Ville, Pays',
    'common.yourwebsite': 'https://votresite.com',
    'common.username': 'nomdutilisateur',
    'common.usernameHandle': '@nomdutilisateur',
  },
  
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.bookmarks': 'Lesezeichen',
    'nav.profile': 'Profil',
    'nav.settings': 'Einstellungen',
    'nav.signOut': 'Abmelden',
    
    // Auth
    'auth.signIn': 'Anmelden',
    'auth.signInWithGoogle': 'Mit Google anmelden',
    'auth.welcome': 'Willkommen zurück',
    'auth.signingIn': 'Anmeldung läuft...',
    
    // Settings
    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Verwalten Sie Ihre Kontoeinstellungen und Präferenzen',
    'settings.profile': 'Profil',
    'settings.appearance': 'Erscheinungsbild',
    'settings.preferences': 'Präferenzen',
    'settings.dangerZone': 'Gefahrenzone',
    
    'settings.theme': 'Design',
    'settings.light': 'Hell',
    'settings.dark': 'Dunkel',
    'settings.system': 'System',
    
    'settings.notifications': 'E-Mail-Benachrichtigungen',
    'settings.notificationsDesc': 'Erhalten Sie E-Mail-Updates über Ihre Lesezeichen',
    'settings.autoSave': 'Automatisch speichern',
    'settings.autoSaveDesc': 'Speichern Sie Ihre Änderungen automatisch',
    'settings.language': 'Sprache',
    
    'settings.signOut': 'Abmelden',
    'settings.signOutDesc': 'Auf diesem Gerät abmelden',
    'settings.signingOut': 'Abmeldung läuft...',
    
    // Profile
    'profile.title': 'Profil',
    'profile.subtitle': 'Verwalten Sie Ihr professionelles Profil und öffentliche Informationen',
    'profile.basicInfo': 'Grundlegende Informationen',
    'profile.socialLinks': 'Soziale Links',
    'profile.accountInfo': 'Kontoinformationen',
    
    'profile.displayName': 'Anzeigename',
    'profile.location': 'Standort',
    'profile.bio': 'Biografie',
    'profile.website': 'Website',
    'profile.github': 'GitHub',
    'profile.linkedin': 'LinkedIn',
    'profile.twitter': 'Twitter',
    
    'profile.email': 'E-Mail',
    'profile.memberSince': 'Mitglied seit',
    'profile.lastSignIn': 'Letzte Anmeldung',
    'profile.accountId': 'Konto-ID',
    
    'profile.editProfile': 'Profil bearbeiten',
    'profile.save': 'Speichern',
    'profile.cancel': 'Abbrechen',
    'profile.saving': 'Speichern...',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',
    'common.notSet': 'Nicht festgelegt',
    'common.noBioProvided': 'Keine Biografie angegeben',
    'common.tellUsAboutYourself': 'Erzählen Sie uns über sich...',
    'common.cityCountry': 'Stadt, Land',
    'common.yourwebsite': 'https://ihrewebsite.com',
    'common.username': 'benutzername',
    'common.usernameHandle': '@benutzername',
  },
  
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.bookmarks': '书签',
    'nav.profile': '个人资料',
    'nav.settings': '设置',
    'nav.signOut': '退出登录',
    
    // Auth
    'auth.signIn': '登录',
    'auth.signInWithGoogle': '使用 Google 登录',
    'auth.welcome': '欢迎回来',
    'auth.signingIn': '登录中...',
    
    // Settings
    'settings.title': '设置',
    'settings.subtitle': '管理您的帐户设置和首选项',
    'settings.profile': '个人资料',
    'settings.appearance': '外观',
    'settings.preferences': '首选项',
    'settings.dangerZone': '危险区域',
    
    'settings.theme': '主题',
    'settings.light': '浅色',
    'settings.dark': '深色',
    'settings.system': '系统',
    
    'settings.notifications': '邮件通知',
    'settings.notificationsDesc': '接收有关您书签的邮件更新',
    'settings.autoSave': '自动保存',
    'settings.autoSaveDesc': '自动保存您的更改',
    'settings.language': '语言',
    
    'settings.signOut': '退出登录',
    'settings.signOutDesc': '在此设备上退出登录',
    'settings.signingOut': '退出中...',
    
    // Profile
    'profile.title': '个人资料',
    'profile.subtitle': '管理您的专业资料和公开信息',
    'profile.basicInfo': '基本信息',
    'profile.socialLinks': '社交链接',
    'profile.accountInfo': '帐户信息',
    
    'profile.displayName': '显示名称',
    'profile.location': '位置',
    'profile.bio': '简介',
    'profile.website': '网站',
    'profile.github': 'GitHub',
    'profile.linkedin': 'LinkedIn',
    'profile.twitter': 'Twitter',
    
    'profile.email': '电子邮件',
    'profile.memberSince': '注册时间',
    'profile.lastSignIn': '最后登录',
    'profile.accountId': '帐户 ID',
    
    'profile.editProfile': '编辑个人资料',
    'profile.save': '保存',
    'profile.cancel': '取消',
    'profile.saving': '保存中...',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.close': '关闭',
    'common.notSet': '未设置',
    'common.noBioProvided': '未提供简介',
    'common.tellUsAboutYourself': '介绍一下您自己...',
    'common.cityCountry': '城市，国家',
    'common.yourwebsite': 'https://yourwebsite.com',
    'common.username': '用户名',
    'common.usernameHandle': '@用户名',
  },
  
  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.bookmarks': 'ブックマーク',
    'nav.profile': 'プロフィール',
    'nav.settings': '設定',
    'nav.signOut': 'ログアウト',
    
    // Auth
    'auth.signIn': 'ログイン',
    'auth.signInWithGoogle': 'Googleでログイン',
    'auth.welcome': 'おかえりなさい',
    'auth.signingIn': 'ログイン中...',
    
    // Settings
    'settings.title': '設定',
    'settings.subtitle': 'アカウント設定と設定を管理',
    'settings.profile': 'プロフィール',
    'settings.appearance': '外観',
    'settings.preferences': '設定',
    'settings.dangerZone': '危険ゾーン',
    
    'settings.theme': 'テーマ',
    'settings.light': 'ライト',
    'settings.dark': 'ダーク',
    'settings.system': 'システム',
    
    'settings.notifications': 'メール通知',
    'settings.notificationsDesc': 'ブックマークに関するメール更新を受け取る',
    'settings.autoSave': '自動保存',
    'settings.autoSaveDesc': '変更を自動的に保存',
    'settings.language': '言語',
    
    'settings.signOut': 'ログアウト',
    'settings.signOutDesc': 'このデバイスでログアウト',
    'settings.signingOut': 'ログアウト中...',
    
    // Profile
    'profile.title': 'プロフィール',
    'profile.subtitle': 'プロフェッショナルプロフィールと公開情報を管理',
    'profile.basicInfo': '基本情報',
    'profile.socialLinks': 'ソーシャルリンク',
    'profile.accountInfo': 'アカウント情報',
    
    'profile.displayName': '表示名',
    'profile.location': '場所',
    'profile.bio': '自己紹介',
    'profile.website': 'ウェブサイト',
    'profile.github': 'GitHub',
    'profile.linkedin': 'LinkedIn',
    'profile.twitter': 'Twitter',
    
    'profile.email': 'メール',
    'profile.memberSince': '登録日',
    'profile.lastSignIn': '最終ログイン',
    'profile.accountId': 'アカウントID',
    
    'profile.editProfile': 'プロフィール編集',
    'profile.save': '保存',
    'profile.cancel': 'キャンセル',
    'profile.saving': '保存中...',
    
    // Common
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.close': '閉じる',
    'common.notSet': '未設定',
    'common.noBioProvided': '自己紹介が提供されていません',
    'common.tellUsAboutYourself': '自己紹介を教えてください...',
    'common.cityCountry': '都市、国',
    'common.yourwebsite': 'https://yourwebsite.com',
    'common.username': 'ユーザー名',
    'common.usernameHandle': '@ユーザー名',
  }
};

interface LanguageContextType {
  t: (key: string) => string;
  currentLanguage: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  
  const t = (key: string): string => {
    const lang = settings.language || 'en';
    return translations[lang]?.[key] || translations['en'][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ t, currentLanguage: settings.language || 'en' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
