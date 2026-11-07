/*
 * ==========================================================================
 * DEJA 2-BIT PIXEL ART & MOTION GRAPHICS NSIS INSTALLER THEME
 * 4-Tone Palette derived directly from the Deja Fallen Angel 2-Bit Website:
 *   Bit 00 (Obsidian Ink) : #0B090A / #141012 / #1B1518
 *   Bit 01 (Crimson Wing) : #8C2D33 / #C43B44 / #4A181B
 *   Bit 10 (Ash Pewter)   : #968E8B / #B8B0AC
 *   Bit 11 (Bone Ivory)   : #F4EFEA
 * ==========================================================================
 */

!define MUI_BGCOLOR "0B090A"
!define MUI_TEXTCOLOR "F4EFEA"
!define MUI_DIRECTORYPAGE_BGCOLOR "1B1518"
!define MUI_DIRECTORYPAGE_TEXTCOLOR "F4EFEA"
!define MUI_INSTFILESPAGE_COLORS "F4EFEA 141012"
!define MUI_INSTFILESPAGE_PROGRESSBAR "smooth"
!define MUI_FINISHPAGE_LINK_COLOR "C43B44"
!define MUI_FINISHPAGE_TEXT_LARGE
!define MUI_FORCECLASSICCONTROLS
!define MUI_WELCOMEFINISHPAGE_BITMAP_STRETCH "FitControl"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP_STRETCH "FitControl"
!define MUI_HEADERIMAGE_BITMAP_STRETCH "FitControl"

!ifdef BUILD_UNINSTALLER
  !define MUI_FINISHPAGE_TITLE "DEJA v${VERSION} // UNINSTALLED"
  !define MUI_FINISHPAGE_TEXT "Deja ${VERSION} has been removed from your computer.$\r$\n$\r$\nClick Finish to close this wizard."
!else
  !define MUI_FINISHPAGE_TITLE "DEJA v${VERSION} // SYSTEM READY"
  !define MUI_FINISHPAGE_TEXT "Deja ${VERSION} has been installed on your computer.$\r$\n$\r$\n160kbps Opus audio, 60fps word-synced lyrics, and 2-Bit Dither UI are ready.$\r$\n$\r$\nClick Finish to close Setup."
  !define MUI_FINISHPAGE_RUN_TEXT "Launch Deja v${VERSION} Now"
!endif

Var DejaFontMono
Var DejaFontMonoBold
Var DejaFontSubHeader
Var DejaFontHeader
Var DejaFontTitle

!macro DejaTwoBitInitFonts
  ${If} $DejaFontMono == ""
  ${OrIf} $DejaFontMono == 0
    CreateFont $DejaFontMono "Consolas" "9" "400"
    CreateFont $DejaFontMonoBold "Consolas" "9" "700"
    CreateFont $DejaFontSubHeader "Consolas" "8" "700"
    CreateFont $DejaFontHeader "Consolas" "10" "700"
    CreateFont $DejaFontTitle "Consolas" "12" "700"
  ${EndIf}
!macroend

!macro DejaTwoBitStripTransparentExStyle HWND_CTRL
  Push $R8
  System::Call 'USER32::GetWindowLongW(p ${HWND_CTRL}, i -20)i.R8'
  IntOp $R8 $R8 & 0xFFFFFFDF
  System::Call 'USER32::SetWindowLongW(p ${HWND_CTRL}, i -20, i R8)'
  Pop $R8
!macroend

!macro DejaTwoBitStyleSeparatorLine HWND_LINE COLOR_HEX
  Push $R8
  ${If} ${HWND_LINE} != 0
    System::Call 'USER32::GetWindowLongW(p ${HWND_LINE}, i -16)i.R8'
    IntOp $R8 $R8 & 0xFFFFFFE0
    System::Call 'USER32::SetWindowLongW(p ${HWND_LINE}, i -16, i R8)'
    System::Call 'USER32::GetWindowLongW(p ${HWND_LINE}, i -20)i.R8'
    IntOp $R8 $R8 & 0xFFFDFFDF
    System::Call 'USER32::SetWindowLongW(p ${HWND_LINE}, i -20, i R8)'
    SetCtlColors ${HWND_LINE} "${COLOR_HEX}" "${COLOR_HEX}"
    System::Call 'USER32::SetWindowPos(p ${HWND_LINE}, p 0, i 0, i 0, i 0, i 0, i 0x0037)'
  ${EndIf}
  Pop $R8
!macroend

!macro DejaTwoBitStyleDarkButton HWND_BTN FONT_HANDLE
  ${If} ${HWND_BTN} != 0
    System::Call 'uxtheme::#133(p ${HWND_BTN}, i 1)'
    System::Call 'UXTHEME::SetWindowTheme(p ${HWND_BTN}, w "DarkMode_Explorer", p 0)'
    SendMessage ${HWND_BTN} ${WM_SETFONT} ${FONT_HANDLE} 1
    SetCtlColors ${HWND_BTN} "F4EFEA" "1B1518"
  ${EndIf}
!macroend

!macro DejaTwoBitApplyOuterTheme
  Push $0
  Push $1

  !insertmacro DejaTwoBitInitFonts

  ; Enable Windows 10/11 Dark Mode App & Window + 2-Bit Obsidian Caption & Crimson Border
  ; COLORREF is 0x00BBGGRR:
  ;   #0B090A (Obsidian Ink) -> 0x000A090B
  ;   #F4EFEA (Bone Ivory)   -> 0x00EAEFF4
  ;   #8C2D33 (Crimson Wing) -> 0x00332D8C
  System::Call 'uxtheme::#135(i 2)'
  System::Call 'uxtheme::#133(p $HWNDPARENT, i 1)'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 20, *i 1, i 4)'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 19, *i 1, i 4)'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 35, *i 0x000A090B, i 4)'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 36, *i 0x00EAEFF4, i 4)'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 34, *i 0x00332D8C, i 4)'

  ; Outer Dialog Window Background (#0B090A Obsidian Ink)
  SetCtlColors $HWNDPARENT "F4EFEA" "0B090A"

  ; Inner Dialog Host Frame (1018 & 1044)
  GetDlgItem $0 $HWNDPARENT 1018
  ${If} $0 != 0
    SetCtlColors $0 "F4EFEA" "0B090A"
  ${EndIf}
  GetDlgItem $0 $HWNDPARENT 1044
  ${If} $0 != 0
    SetCtlColors $0 "F4EFEA" "0B090A"
  ${EndIf}

  ; Top Header Background & Typography (1034, 1037, 1038)
  GetDlgItem $0 $HWNDPARENT 1034
  ${If} $0 != 0
    SetCtlColors $0 "F4EFEA" "0B090A"
  ${EndIf}

  GetDlgItem $0 $HWNDPARENT 1037
  ${If} $0 != 0
    !insertmacro DejaTwoBitStripTransparentExStyle $0
    SendMessage $0 ${WM_SETFONT} $DejaFontHeader 1
    SetCtlColors $0 "F4EFEA" "0B090A"
  ${EndIf}

  GetDlgItem $0 $HWNDPARENT 1038
  ${If} $0 != 0
    !insertmacro DejaTwoBitStripTransparentExStyle $0
    SendMessage $0 ${WM_SETFONT} $DejaFontMono 1
    SetCtlColors $0 "B8B0AC" "0B090A"
  ${EndIf}

  ; Convert legacy Win95 etched 3D lines (1035, 1036, 1045) into 2-Bit Crimson Wing (#8C2D33) rules
  GetDlgItem $0 $HWNDPARENT 1035
  !insertmacro DejaTwoBitStyleSeparatorLine $0 "8C2D33"
  GetDlgItem $0 $HWNDPARENT 1036
  !insertmacro DejaTwoBitStyleSeparatorLine $0 "8C2D33"
  GetDlgItem $0 $HWNDPARENT 1045
  !insertmacro DejaTwoBitStyleSeparatorLine $0 "8C2D33"

  ; Hide legacy Win95 3D shadow duplicate label (1028) & style crisp 2-Bit Branding label (1256)
  GetDlgItem $0 $HWNDPARENT 1028
  ${If} $0 != 0
    ShowWindow $0 ${SW_HIDE}
  ${EndIf}

  GetDlgItem $0 $HWNDPARENT 1256
  ${If} $0 != 0
    !insertmacro DejaTwoBitStripTransparentExStyle $0
    SendMessage $0 ${WM_SETFONT} $DejaFontSubHeader 1
    SetCtlColors $0 "968E8B" "0B090A"
    System::Call 'USER32::SetWindowPos(p r0, p 0, i 0, i 0, i 162, i 15, i 0x0016)'
  ${EndIf}

  ; Navigation Buttons (1=Next/Install/Finish, 2=Cancel, 3=Back)
  GetDlgItem $0 $HWNDPARENT 1
  !insertmacro DejaTwoBitStyleDarkButton $0 $DejaFontMonoBold

  GetDlgItem $0 $HWNDPARENT 2
  !insertmacro DejaTwoBitStyleDarkButton $0 $DejaFontMono

  GetDlgItem $0 $HWNDPARENT 3
  !insertmacro DejaTwoBitStyleDarkButton $0 $DejaFontMono

  Pop $1
  Pop $0
!macroend

!macro DejaTwoBitApplyPageTheme
  Push $0
  Push $1
  Push $2
  Push $3
  Push $4
  Push $5

  !insertmacro DejaTwoBitApplyOuterTheme

  ; Ensure 1028 stays hidden even after muiPageUnloadFullWindow restores it
  GetDlgItem $1 $HWNDPARENT 1028
  ${If} $1 != 0
    ShowWindow $1 ${SW_HIDE}
  ${EndIf}

  ; Iterate over ALL #32770 child dialogs of $HWNDPARENT (including Welcome, Directory, InstFiles, and Finish)
  StrCpy $0 0
  ${Do}
    System::Call 'USER32::FindWindowExW(p $HWNDPARENT, p r0, w "#32770", p 0)p.r0'
    ${If} $0 == 0
      ${Break}
    ${EndIf}

    SetCtlColors $0 "F4EFEA" "0B090A"

    StrCpy $1 0
    ${Do}
      System::Call 'USER32::FindWindowExW(p r0, p r1, p 0, p 0)p.r1'
      ${If} $1 == 0
        ${Break}
      ${EndIf}

      System::Call 'USER32::GetClassNameW(p r1, w .r3, i 64)'
      System::Call 'USER32::GetDlgCtrlID(p r1)i.r4'
      System::Call 'USER32::GetWindowLongW(p r1, i -16)i.r5'

      ${If} $3 == "Static"
        IntOp $5 $5 & 0x1F
        ; Skip SS_ICON (3) and SS_BITMAP (14) so 2-Bit BMP artwork is untouched
        ${If} $5 != 3
        ${AndIf} $5 != 14
          !insertmacro DejaTwoBitStripTransparentExStyle $1
          ${If} $4 == 1023
          ${OrIf} $4 == 1024
            ; Space required / Space available telemetry readouts (expand height to 16px so descenders never clip)
            SendMessage $1 ${WM_SETFONT} $DejaFontSubHeader 1
            SetCtlColors $1 "C43B44" "0B090A"
            System::Call 'USER32::SetWindowPos(p r1, p 0, i 0, i 0, i 250, i 16, i 0x0016)'
          ${ElseIf} $4 == 1201
            SendMessage $1 ${WM_SETFONT} $DejaFontTitle 1
            SetCtlColors $1 "C43B44" "0B090A"
          ${Else}
            SendMessage $1 ${WM_SETFONT} $DejaFontMono 1
            SetCtlColors $1 "F4EFEA" "0B090A"
          ${EndIf}
        ${EndIf}
      ${ElseIf} $3 == "Button"
        IntOp $5 $5 & 0x0F
        ${If} $5 == 7
          ; GroupBox (e.g. Destination Folder 1020)
          System::Call 'UXTHEME::SetWindowTheme(p r1, w " ", w " ")'
          SendMessage $1 ${WM_SETFONT} $DejaFontMonoBold 1
          SetCtlColors $1 "C43B44" "0B090A"
        ${ElseIf} $5 == 2
        ${OrIf} $5 == 3
        ${OrIf} $5 == 4
        ${OrIf} $5 == 9
          ; CheckBox / RadioButton (Install Mode & Launch Deja options)
          System::Call 'UXTHEME::SetWindowTheme(p r1, w " ", w " ")'
          SendMessage $1 ${WM_SETFONT} $DejaFontMonoBold 1
          SetCtlColors $1 "F4EFEA" "0B090A"
        ${Else}
          ; PushButton (e.g. Browse...)
          !insertmacro DejaTwoBitStyleDarkButton $1 $DejaFontMonoBold
        ${EndIf}
      ${ElseIf} $3 == "Edit"
        ; Destination Folder Path Input (1019) - strip 3D sunken edge, add crisp flat border, clear blue highlight
        System::Call 'USER32::GetWindowLongW(p r1, i -20)i.r5'
        IntOp $5 $5 & 0xFFFFFDFF
        System::Call 'USER32::SetWindowLongW(p r1, i -20, i r5)'
        System::Call 'USER32::GetWindowLongW(p r1, i -16)i.r5'
        IntOp $5 $5 | 0x00800000
        System::Call 'USER32::SetWindowLongW(p r1, i -16, i r5)'
        System::Call 'USER32::SetWindowPos(p r1, p 0, i 0, i 0, i 0, i 0, i 0x0037)'
        SendMessage $1 ${WM_SETFONT} $DejaFontMono 1
        SetCtlColors $1 "F4EFEA" "1B1518"
        SendMessage $1 0x00B1 -1 0
      ${ElseIf} $3 == "msctls_progress32"
        ; 2-Bit Crimson Wing Progress Bar on Obsidian Track
        System::Call 'UXTHEME::SetWindowTheme(p r1, w " ", w " ")'
        SendMessage $1 0x0409 0 0x00443BC4 ; PBM_SETBARCOLOR (#C43B44)
        SendMessage $1 0x2001 0 0x0018151B ; PBM_SETBKCOLOR  (#1B1518)
      ${ElseIf} $3 == "SysListView32"
        SendMessage $1 ${WM_SETFONT} $DejaFontMono 1
        SendMessage $1 0x1001 0 0x0018151B ; LVM_SETBKCOLOR
        SendMessage $1 0x1026 0 0x0018151B ; LVM_SETTEXTBKCOLOR
        SendMessage $1 0x1024 0 0x00EAEFF4 ; LVM_SETTEXTCOLOR
      ${EndIf}
    ${Loop}
  ${Loop}

  !ifdef MULTIUSER_INSTALLMODEPAGE | MULTIUSER_UNINSTALLMODEPAGE
    ${If} $RadioButtonLabel1 != 0
      System::Call 'USER32::SetWindowPos(p $RadioButtonLabel1, p 0, i 0, i 148, i 450, i 76, i 0x0014)'
    ${EndIf}
  !endif

  !ifdef MUI_WELCOMEPAGE_INTERFACE
    ${If} $mui.WelcomePage.Title != 0
      !insertmacro DejaTwoBitStripTransparentExStyle $mui.WelcomePage.Title
      SendMessage $mui.WelcomePage.Title ${WM_SETFONT} $DejaFontTitle 1
      SetCtlColors $mui.WelcomePage.Title "C43B44" "0B090A"
    ${EndIf}
    ${If} $mui.WelcomePage.Text != 0
      !insertmacro DejaTwoBitStripTransparentExStyle $mui.WelcomePage.Text
      SendMessage $mui.WelcomePage.Text ${WM_SETFONT} $DejaFontMono 1
      SetCtlColors $mui.WelcomePage.Text "F4EFEA" "0B090A"
    ${EndIf}
  !endif

  !ifdef MUI_FINISHPAGE_INTERFACE
    ${If} $mui.FinishPage.Title != 0
      !insertmacro DejaTwoBitStripTransparentExStyle $mui.FinishPage.Title
      SendMessage $mui.FinishPage.Title ${WM_SETFONT} $DejaFontTitle 1
      SetCtlColors $mui.FinishPage.Title "C43B44" "0B090A"
    ${EndIf}
    ${If} $mui.FinishPage.Text != 0
      !insertmacro DejaTwoBitStripTransparentExStyle $mui.FinishPage.Text
      SendMessage $mui.FinishPage.Text ${WM_SETFONT} $DejaFontMono 1
      SetCtlColors $mui.FinishPage.Text "F4EFEA" "0B090A"
    ${EndIf}
    !ifdef MUI_FINISHPAGE_RUN
      ${If} $mui.FinishPage.Run != 0
        System::Call 'UXTHEME::SetWindowTheme(p $mui.FinishPage.Run, w " ", w " ")'
        SendMessage $mui.FinishPage.Run ${WM_SETFONT} $DejaFontMonoBold 1
        SetCtlColors $mui.FinishPage.Run "F4EFEA" "0B090A"
      ${EndIf}
    !endif
  !endif

  System::Call 'USER32::RedrawWindow(p $HWNDPARENT, p 0, p 0, i 0x0585)'

  Pop $5
  Pop $4
  Pop $3
  Pop $2
  Pop $1
  Pop $0
!macroend

;--------------------------------
; Pre-load MUI2 with global 2-Bit Page Show hook
;--------------------------------
!ifndef MUI_INCLUDED
!verbose push 3
!define MUI_INCLUDED
!define MUI_SYSVERSION "2.1"
!verbose pop

!verbose push 3
!define /IfNDef MUI_VERBOSE 3
!verbose ${MUI_VERBOSE}

!addincludedir "${NSISDIR}\Contrib\Modern UI 2"

!include WinMessages.nsh
!include LogicLib.nsh
!include nsDialogs.nsh
!include LangFile.nsh

!macro MUI_DEFAULT SYMBOL CONTENT
  !ifndef "${SYMBOL}"
    !define "${SYMBOL}" "${CONTENT}"
  !endif
!macroend

!macro MUI_SET SYMBOL CONTENT
  !insertmacro MUI_UNSET "${SYMBOL}"
  !define "${SYMBOL}" "${CONTENT}"
!macroend

!macro MUI_UNSET SYMBOL
  !ifdef "${SYMBOL}"
    !undef "${SYMBOL}"
  !endif
!macroend

!include "Deprecated.nsh"
!include "Interface.nsh"
!include "Localization.nsh"

; Custom Pages.nsh integration that automatically runs DejaTwoBitApplyPageTheme on every page SHOW
!macro MUI_PAGE_INIT
  !ifdef MUI_INSERT
    !warning "MUI_PAGE_* inserted after MUI_LANGUAGE"
  !endif
  !insertmacro MUI_INTERFACE
  !insertmacro MUI_UNSET MUI_PAGE_UNINSTALLER
  !insertmacro MUI_UNSET MUI_PAGE_UNINSTALLER_PREFIX
  !insertmacro MUI_UNSET MUI_PAGE_UNINSTALLER_FUNCPREFIX
  !insertmacro MUI_SET MUI_PAGE_UNINSTALLER_PREFIX ""
  !insertmacro MUI_SET MUI_PAGE_UNINSTALLER_FUNCPREFIX ""
  !insertmacro MUI_UNSET MUI_UNIQUEID
  !define MUI_UNIQUEID ${__LINE__}
!macroend

!macro MUI_UNPAGE_INIT
  !ifdef MUI_INSERT
    !warning "MUI_UNPAGE_* inserted after MUI_LANGUAGE"
  !endif
  !insertmacro MUI_INTERFACE
  !insertmacro MUI_SET MUI_UNINSTALLER ""
  !insertmacro MUI_SET MUI_PAGE_UNINSTALLER ""
  !insertmacro MUI_SET MUI_PAGE_UNINSTALLER_PREFIX "UN"
  !insertmacro MUI_SET MUI_PAGE_UNINSTALLER_FUNCPREFIX "un."
  !insertmacro MUI_UNSET MUI_UNIQUEID
  !define MUI_UNIQUEID ${__LINE__}
!macroend

!macro MUI_HEADER_TEXT_PAGE TEXT SUBTEXT
  !ifdef MUI_PAGE_HEADER_TEXT & MUI_PAGE_HEADER_SUBTEXT
    !insertmacro MUI_HEADER_TEXT "${MUI_PAGE_HEADER_TEXT}" "${MUI_PAGE_HEADER_SUBTEXT}"
  !else ifdef MUI_PAGE_HEADER_TEXT
    !insertmacro MUI_HEADER_TEXT "${MUI_PAGE_HEADER_TEXT}" "${SUBTEXT}"
  !else ifdef MUI_PAGE_HEADER_SUBTEXT
    !insertmacro MUI_HEADER_TEXT "${TEXT}" "${MUI_PAGE_HEADER_SUBTEXT}"
  !else
    !insertmacro MUI_HEADER_TEXT "${TEXT}" "${SUBTEXT}"
  !endif
  !insertmacro MUI_UNSET MUI_PAGE_HEADER_TEXT
  !insertmacro MUI_UNSET MUI_PAGE_HEADER_SUBTEXT
!macroend

!macro MUI_HEADER_TEXT TEXT SUBTEXT
  !verbose push
  !verbose ${MUI_VERBOSE}
  !ifdef MUI_HEADER_TRANSPARENT_TEXT
    LockWindow on
  !endif
  SendMessage $mui.Header.Text ${WM_SETTEXT} 0 "STR:${TEXT}"
  SendMessage $mui.Header.SubText ${WM_SETTEXT} 0 "STR:${SUBTEXT}"
  !ifdef MUI_HEADER_TRANSPARENT_TEXT
    LockWindow off
  !endif
  !verbose pop
!macroend

!macro MUI_PAGE_FUNCTION_CUSTOM TYPE
  !ifdef MUI_PAGE_CUSTOMFUNCTION_${TYPE}
    Call "${MUI_PAGE_CUSTOMFUNCTION_${TYPE}}"
    !undef MUI_PAGE_CUSTOMFUNCTION_${TYPE}
  !endif
  !if "${TYPE}" == "SHOW"
    !insertmacro DejaTwoBitApplyPageTheme
  !endif
!macroend

!macro MUI_PAGE_FUNCTION_FULLWINDOW
  !ifndef MUI_${MUI_PAGE_UNINSTALLER_PREFIX}PAGE_FUNCTION_FULLWINDOW
    !define MUI_${MUI_PAGE_UNINSTALLER_PREFIX}PAGE_FUNCTION_FULLWINDOW
    Function ${MUI_PAGE_UNINSTALLER_FUNCPREFIX}muiPageLoadFullWindow
      LockWindow on
      ShowWindow $mui.Branding.Background ${SW_HIDE}
      ShowWindow $mui.Branding.Text ${SW_HIDE}
      ShowWindow $mui.Header.Text ${SW_HIDE}
      ShowWindow $mui.Header.SubText ${SW_HIDE}
      ShowWindow $mui.Header.Image ${SW_HIDE}
      ShowWindow $mui.Line.Standard ${SW_HIDE}
      ShowWindow $mui.Line.FullWindow ${SW_NORMAL}
      LockWindow off
    FunctionEnd
    Function ${MUI_PAGE_UNINSTALLER_FUNCPREFIX}muiPageUnloadFullWindow
      LockWindow on
      ShowWindow $mui.Branding.Background ${SW_HIDE}
      ShowWindow $mui.Branding.Text ${SW_NORMAL}
      ShowWindow $mui.Header.Text ${SW_NORMAL}
      ShowWindow $mui.Header.SubText ${SW_NORMAL}
      ShowWindow $mui.Header.Image ${SW_NORMAL}
      ShowWindow $mui.Line.Standard ${SW_NORMAL}
      ShowWindow $mui.Line.FullWindow ${SW_HIDE}
      LockWindow off
    FunctionEnd
  !endif
!macroend

!macro MUI_INTERNAL_FULLWINDOW_LOADWIZARDIMAGE _un _hwndImg _ImgPath _RetImgHandle
  !ifdef MUI_${_un}WELCOMEFINISHPAGE_BITMAP_NOSTRETCH
    !insertmacro MUI_DEFAULT MUI_${_un}WELCOMEFINISHPAGE_BITMAP_STRETCH NoStretchNoCropNoAlign
  !endif
  !insertmacro MUI_DEFAULT MUI_${_un}WELCOMEFINISHPAGE_BITMAP_STRETCH FitControl
  !if "${MUI_${_un}WELCOMEFINISHPAGE_BITMAP_STRETCH}" == "NoStretchNoCropNoAlign"
    ${NSD_SetImage} ${_hwndImg} "${_ImgPath}" "${_RetImgHandle}"
  !else
    ${NSD_SetStretchedImage} ${_hwndImg} "${_ImgPath}" "${_RetImgHandle}"
  !endif
!macroend

!include Util.nsh

!include "Pages\Components.nsh"
!include "Pages\Directory.nsh"
!include "Pages\Finish.nsh"
!include "Pages\InstallFiles.nsh"
!include "Pages\License.nsh"
!include "Pages\StartMenu.nsh"
!include "Pages\UninstallConfirm.nsh"
!include "Pages\Welcome.nsh"

!macro MUI_INSERT
  !ifndef MUI_INSERT
    !define MUI_INSERT
    !insertmacro MUI_INTERFACE
    !insertmacro MUI_FUNCTION_GUIINIT
    !insertmacro MUI_FUNCTION_ABORTWARNING
    !ifdef MUI_UNINSTALLER
      !insertmacro MUI_UNFUNCTION_GUIINIT
      !insertmacro MUI_FUNCTION_UNABORTWARNING
    !endif
  !endif
!macroend

!verbose pop
!endif

;--------------------------------
; 2-Bit Custom Welcome, Finish & Header Hooks for electron-builder
;--------------------------------
!macro customHeader
  BrandingText "DEJA v${VERSION} // 2-BIT UI"
!macroend

!macro customWelcomePage
  !insertmacro skipPageIfUpdated
  !define MUI_WELCOMEPAGE_TITLE "DEJA v${VERSION} // 2-BIT SETUP"
  !define MUI_WELCOMEPAGE_TEXT "Welcome to the Deja ${VERSION} setup wizard.$\r$\n$\r$\nApple Music + 2-Bit UI for YouTube Music:$\r$\n$\r$\n  [00] 160kbps Opus && 5-Band Pro EQ$\r$\n  [01] 60fps Word-Synced Live Lyrics$\r$\n  [10] AutoMix Crossfade && Listen Room$\r$\n  [11] 2-Bit Obsidian && Ivory Theme$\r$\n$\r$\nClick Next to configure installation."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "UNINSTALL DEJA v${VERSION}"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will remove Deja ${VERSION} from your computer.$\r$\n$\r$\nClick Next to continue with the uninstallation."
  !insertmacro MUI_UNPAGE_WELCOME
!macroend
