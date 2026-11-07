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
!define MUI_WELCOMEFINISHPAGE_BITMAP_STRETCH "FitControl"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP_STRETCH "FitControl"
!define MUI_HEADERIMAGE_BITMAP_STRETCH "FitControl"

!ifdef BUILD_UNINSTALLER
  !define MUI_FINISHPAGE_TITLE "DEJA v${VERSION} // UNINSTALLED"
  !define MUI_FINISHPAGE_TEXT "Deja ${VERSION} has been removed from your computer.$\r$\n$\r$\nClick Finish to close this wizard."
!else
  !define MUI_FINISHPAGE_TITLE "DEJA v${VERSION} // SYSTEM READY"
  !define MUI_FINISHPAGE_TEXT "Deja ${VERSION} has been installed on your computer.$\r$\n$\r$\nYour 2-Bit YouTube Music desktop client is ready with lossless audio routing, 60fps word-synced lyrics, and Discord Rich Presence.$\r$\n$\r$\nClick Finish to close Setup."
  !define MUI_FINISHPAGE_RUN_TEXT "Launch Deja v${VERSION} Now"
!endif

Var DejaFontMono
Var DejaFontMonoBold
Var DejaFontSubHeader

!macro DejaTwoBitInitFonts
  ${If} $DejaFontMono == 0
    CreateFont $DejaFontMono "Consolas" "9" "400"
    CreateFont $DejaFontMonoBold "Consolas" "9" "700"
    CreateFont $DejaFontSubHeader "Consolas" "8" "700"
  ${EndIf}
!macroend

!macro DejaTwoBitStripTransparentExStyle HWND_CTRL
  Push $R8
  System::Call 'USER32::GetWindowLongW(p ${HWND_CTRL}, i -20)i.R8'
  IntOp $R8 $R8 & 0xFFFFFFDF
  System::Call 'USER32::SetWindowLongW(p ${HWND_CTRL}, i -20, i R8)'
  Pop $R8
!macroend

!macro DejaTwoBitApplyOuterTheme
  Push $0
  Push $1

  !insertmacro DejaTwoBitInitFonts

  ; Enable Windows 10/11 Dark Mode Titlebar + 2-Bit Obsidian Caption & Crimson Border
  ; COLORREF is 0x00BBGGRR:
  ;   #0B090A (Obsidian Ink) -> 0x000A090B
  ;   #F4EFEA (Bone Ivory)   -> 0x00EAEFF4
  ;   #8C2D33 (Crimson Wing) -> 0x00332D8C
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 20, *i 1, i 4)'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 19, *i 1, i 4)'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 35, *i 0x000A090B, i 4)'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 36, *i 0x00EAEFF4, i 4)'
  System::Call 'dwmapi::DwmSetWindowAttribute(p $HWNDPARENT, i 34, *i 0x00332D8C, i 4)'

  ; Outer Dialog Window Background (#0B090A Obsidian Ink)
  SetCtlColors $HWNDPARENT "F4EFEA" "0B090A"

  ; Inner Dialog Host Frame (1018)
  GetDlgItem $0 $HWNDPARENT 1018
  ${If} $0 != 0
    SetCtlColors $0 "F4EFEA" "141012"
  ${EndIf}

  ; Top Header Background & Typography (1034, 1037, 1038)
  GetDlgItem $0 $HWNDPARENT 1034
  ${If} $0 != 0
    SetCtlColors $0 "F4EFEA" "0B090A"
  ${EndIf}

  GetDlgItem $0 $HWNDPARENT 1037
  ${If} $0 != 0
    !insertmacro DejaTwoBitStripTransparentExStyle $0
    SetCtlColors $0 "F4EFEA" "0B090A"
  ${EndIf}

  GetDlgItem $0 $HWNDPARENT 1038
  ${If} $0 != 0
    !insertmacro DejaTwoBitStripTransparentExStyle $0
    SetCtlColors $0 "B8B0AC" "0B090A"
  ${EndIf}

  ; Hide legacy Win95 3D shadow duplicate label (1028) & style crisp 2-Bit Branding label (1256)
  GetDlgItem $0 $HWNDPARENT 1028
  ${If} $0 != 0
    ShowWindow $0 ${SW_HIDE}
  ${EndIf}

  GetDlgItem $0 $HWNDPARENT 1256
  ${If} $0 != 0
    !insertmacro DejaTwoBitStripTransparentExStyle $0
    SendMessage $0 ${WM_SETFONT} $DejaFontSubHeader 0
    SetCtlColors $0 "968E8B" "0B090A"
  ${EndIf}

  ; Navigation Buttons (1=Next/Install, 2=Cancel, 3=Back)
  GetDlgItem $0 $HWNDPARENT 1
  ${If} $0 != 0
    SendMessage $0 ${WM_SETFONT} $DejaFontMonoBold 0
    SetCtlColors $0 "F4EFEA" "8C2D33"
  ${EndIf}

  GetDlgItem $0 $HWNDPARENT 2
  ${If} $0 != 0
    SendMessage $0 ${WM_SETFONT} $DejaFontMono 0
    SetCtlColors $0 "F4EFEA" "1B1518"
  ${EndIf}

  GetDlgItem $0 $HWNDPARENT 3
  ${If} $0 != 0
    SendMessage $0 ${WM_SETFONT} $DejaFontMono 0
    SetCtlColors $0 "F4EFEA" "1B1518"
  ${EndIf}

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

  ; Check whether Header Text (1037) is visible to distinguish standard pages from full-window Welcome/Finish pages
  GetDlgItem $1 $HWNDPARENT 1037
  System::Call 'USER32::IsWindowVisible(p r1)i.r2'

  FindWindow $0 "#32770" "" $HWNDPARENT
  ${If} $0 != 0
    ${If} $2 == 0
      SetCtlColors $0 "F4EFEA" "0B090A"
    ${Else}
      SetCtlColors $0 "F4EFEA" "141012"
    ${EndIf}

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
            ; Space required / Space available telemetry readouts (8pt bold so descenders never clip)
            SendMessage $1 ${WM_SETFONT} $DejaFontSubHeader 0
            SetCtlColors $1 "C43B44" "141012"
          ${ElseIf} $2 == 0
            ; Welcome / Finish page labels are styled explicitly below
            SetCtlColors $1 "B8B0AC" "0B090A"
          ${Else}
            SetCtlColors $1 "F4EFEA" "141012"
          ${EndIf}
        ${EndIf}
      ${ElseIf} $3 == "Button"
        IntOp $5 $5 & 0x0F
        ${If} $5 == 7
          ; GroupBox (e.g. Destination Folder 1020)
          System::Call 'UXTHEME::SetWindowTheme(p r1, w " ", w " ")'
          SendMessage $1 ${WM_SETFONT} $DejaFontMonoBold 0
          SetCtlColors $1 "C43B44" "141012"
        ${ElseIf} $5 == 2
        ${OrIf} $5 == 3
        ${OrIf} $5 == 4
        ${OrIf} $5 == 9
          ; CheckBox / RadioButton (Install Mode & Launch Deja options)
          System::Call 'UXTHEME::SetWindowTheme(p r1, w " ", w " ")'
          ${If} $2 == 0
            SetCtlColors $1 "F4EFEA" "0B090A"
          ${Else}
            SetCtlColors $1 "F4EFEA" "141012"
          ${EndIf}
        ${Else}
          ; PushButton (e.g. Browse...)
          SendMessage $1 ${WM_SETFONT} $DejaFontMonoBold 0
          SetCtlColors $1 "F4EFEA" "1B1518"
        ${EndIf}
      ${ElseIf} $3 == "Edit"
        ; Destination Folder Path Input (1019)
        SendMessage $1 ${WM_SETFONT} $DejaFontMono 0
        SetCtlColors $1 "F4EFEA" "1B1518"
      ${ElseIf} $3 == "msctls_progress32"
        ; 2-Bit Crimson Wing Progress Bar on Obsidian Track
        System::Call 'UXTHEME::SetWindowTheme(p r1, w " ", w " ")'
        SendMessage $1 0x0409 0 0x00443BC4 ; PBM_SETBARCOLOR (#C43B44)
        SendMessage $1 0x2001 0 0x0018151B ; PBM_SETBKCOLOR  (#1B1518)
      ${ElseIf} $3 == "SysListView32"
        SendMessage $1 ${WM_SETFONT} $DejaFontMono 0
        SendMessage $1 0x1001 0 0x0018151B ; LVM_SETBKCOLOR
        SendMessage $1 0x1026 0 0x0018151B ; LVM_SETTEXTBKCOLOR
        SendMessage $1 0x1024 0 0x00EAEFF4 ; LVM_SETTEXTCOLOR
      ${EndIf}
    ${Loop}
  ${EndIf}

  !ifdef MUI_WELCOMEPAGE_INTERFACE
    ${If} $mui.WelcomePage.Title != 0
      !insertmacro DejaTwoBitStripTransparentExStyle $mui.WelcomePage.Title
      SetCtlColors $mui.WelcomePage.Title "C43B44" "0B090A"
    ${EndIf}
    ${If} $mui.WelcomePage.Text != 0
      !insertmacro DejaTwoBitStripTransparentExStyle $mui.WelcomePage.Text
      SetCtlColors $mui.WelcomePage.Text "F4EFEA" "0B090A"
    ${EndIf}
  !endif

  !ifdef MUI_FINISHPAGE_INTERFACE
    ${If} $mui.FinishPage.Title != 0
      !insertmacro DejaTwoBitStripTransparentExStyle $mui.FinishPage.Title
      SetCtlColors $mui.FinishPage.Title "C43B44" "0B090A"
    ${EndIf}
    ${If} $mui.FinishPage.Text != 0
      !insertmacro DejaTwoBitStripTransparentExStyle $mui.FinishPage.Text
      SetCtlColors $mui.FinishPage.Text "F4EFEA" "0B090A"
    ${EndIf}
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
  !define MUI_WELCOMEPAGE_TEXT "Welcome to the Deja ${VERSION} setup wizard.$\r$\n$\r$\nApple Music architecture && 2-Bit Dither UI for YouTube Music:$\r$\n$\r$\n  [00] Hi-Res Lossless && 5-Band Parametric EQ$\r$\n  [01] 60fps Word-Synced Apple Music Lyrics$\r$\n  [10] AutoMix Crossfade && Listen Together$\r$\n  [11] 2-Bit Obsidian && Bone Ivory Desktop UI$\r$\n$\r$\nClick Next to configure your installation."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "UNINSTALL DEJA v${VERSION}"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will remove Deja ${VERSION} from your computer.$\r$\n$\r$\nClick Next to continue with the uninstallation."
  !insertmacro MUI_UNPAGE_WELCOME
!macroend
